import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  appEmitter,
  EVENTS,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
  BadRequestError,
} from "src/utils";
import { userDao } from "src/dao/user.dao";
import { authDao } from "src/dao";
import { ALLOWED_USER_CREATIONS } from "src/constants/permissions.constant";
import { UserRole, InvitationStatus, UserStatus, DeleteType } from "src/enums";
import { db } from "src/database/db";

const inviteUser = async (
  email: string,
  role: string,
  firstName: string,
  lastName: string | null,
  inviterId: string,
  inviterRole: UserRole,
) => {
  // Check if role is allowed
  const allowedRoles = ALLOWED_USER_CREATIONS[inviterRole] || [];
  if (!allowedRoles.includes(role as UserRole)) {
    throw new UnAuthorizedError("You are not allowed to invite this role.");
  }

  // Check if user already exists
  const existingUser = await authDao.findByEmail(email);
  if (existingUser) {
    throw new ConflictError("User already exists.");
  }

  // Create invitation
  const token = crypto.randomBytes(32).toString("hex");
  const expiresInDays = 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await userDao.createInvitation({
    email,
    role,
    first_name: firstName,
    last_name: lastName || null,
    invited_by: inviterId,
    token,
    expires_at: expiresAt,
  });

  // Fetch inviter's name for the invitation email
  const { rows } = await db.raw(
    "SELECT first_name,last_name FROM users WHERE id = ?",
    [inviterId],
  );
  const inviter = rows[0];

  appEmitter.emit(EVENTS.EMAIL.INVITE, {
    email,
    role,
    token,
    inviterName: [inviter?.first_name, inviter?.last_name]
      .filter(Boolean)
      .join(" "),
    expiresInDays,
  });
};

const verifyInvite = async (token: string, password: string) => {
  const invitation = await userDao.findInvitationByToken(token);
  if (!invitation) {
    throw new NotFoundError("Invalid or expired invitation token.");
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    await userDao.updateInvitationStatus(
      invitation.id,
      InvitationStatus.EXPIRED,
    );
    throw new UnAuthorizedError("Invitation has expired.");
  }

  // Check if user already exists
  const existingUser = await authDao.findByEmail(invitation.email);
  if (existingUser) {
    throw new ConflictError("User already exists.");
  }

  // Get inviter to set created_by
  const { rows } = await db.raw("SELECT * FROM users WHERE id = ?", [
    invitation.invited_by,
  ]);
  const inviter = rows[0];
  if (!inviter) {
    throw new NotFoundError("Inviter not found.");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await db.transaction(async (trx) => {
    const createdUser = await userDao.createUserFromInvitation(
      {
        email: invitation.email,
        password_hash: passwordHash,
        role: invitation.role,
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        created_by: inviter.id,
      },
      trx,
    );

    if (invitation.role === UserRole.ARTIST) {
      const stageName = invitation.email.split("@")[0];
      const managerId =
        inviter.role === UserRole.ARTIST_MANAGER ? inviter.id : null;
      await userDao.createArtist(
        {
          userId: createdUser.id,
          managerId,
          stageName,
        },
        trx,
      );
    }

    await userDao.updateInvitationStatus(
      invitation.id,
      InvitationStatus.ACCEPTED,
      trx,
    );

    return createdUser;
  });

  return user;
};

const getUsers = async (
  limit: number,
  offset: number,
  search?: string,
  role?: UserRole,
  status?: UserStatus,
) => {
  return await userDao.getUsers(limit, offset, search, role, status);
};

/**
 * Deletes a user based on their role and the type of delete requested.
 *
 * When no type is given, it defaults to a hard delete.
 *
 * **When deleting an artist:**
 * - Super admins have the flexibility to choose
 *   - hard delete removes the artist from the system entirely (user + all cascading data)
 *   - soft delete removes the artist and their content, but keeps the user account as inactive.
 * - Artist managers can only soft delete, and only for artists under their management.
 *   - soft delete removes the artist and their content(artist + all cascading data),
 *     but keeps the user account as inactive.
 *   - If they attempt a hard delete, an error is thrown.
 *
 * **When deleting a super_admin or artist_manager:**
 * - Only a super_admin can do this.
 * - Hard delete works if nobody else was created by this user. If there are references,
 *   the operation stops with a conflict error explaining why.
 * - Soft delete simply deactivates the account by marking the user as inactive.
 */
const deleteUser = async (
  targetUserId: string,
  currentUserId: string,
  currentUserRole: UserRole,
  deleteType?: DeleteType,
) => {
  if (targetUserId === currentUserId) {
    throw new BadRequestError("You cannot delete yourself.");
  }

  const targetUser = await authDao.findUserById(targetUserId);
  if (!targetUser) {
    throw new NotFoundError("User not found.");
  }

  const type = deleteType || DeleteType.HARD;

  if (targetUser.role === UserRole.ARTIST) {
    const artist = await userDao.findArtistByUserId(targetUserId);
    if (!artist) {
      throw new NotFoundError("Artist not found.");
    }

    if (currentUserRole === UserRole.SUPER_ADMIN) {
      if (type === DeleteType.SOFT) {
        await db.transaction(async (trx) => {
          await userDao.deleteArtistByUserId(targetUserId, trx);
          await userDao.softDeleteUser(targetUserId, trx);
        });
      } else {
        await userDao.deleteUserById(targetUserId);
      }
    } else if (currentUserRole === UserRole.ARTIST_MANAGER) {
      if (type === DeleteType.HARD) {
        throw new BadRequestError(
          "Artist managers can only soft delete artists.",
        );
      }
      if (artist.manager_id !== currentUserId) {
        throw new UnAuthorizedError(
          "You can only delete artists managed by you.",
        );
      }
      await db.transaction(async (trx) => {
        await userDao.deleteArtistByUserId(targetUserId, trx);
        await userDao.softDeleteUser(targetUserId, trx);
      });
    }
  } else {
    if (currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new UnAuthorizedError("Only super admin can delete this user.");
    }

    if (type === DeleteType.SOFT) {
      await userDao.softDeleteUser(targetUserId);
      return;
    }

    const createdByCount = await userDao.countUsersCreatedBy(targetUserId);

    if (createdByCount > 0) {
      throw new ConflictError(
        `Cannot hard delete user. ${createdByCount} user(s) were created by this user. Use soft delete instead, or reassign this user to another super admin user first.`,
      );
    }

    await userDao.deleteUserById(targetUserId);
  }
};

export const userService = { inviteUser, verifyInvite, getUsers, deleteUser };
