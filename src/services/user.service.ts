import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  appEmitter,
  EVENTS,
  ConflictError,
  NotFoundError,
  UnAuthorizedError,
} from "src/utils";
import { userDao } from "src/dao/user.dao";
import { authDao } from "src/dao";
import { ALLOWED_USER_CREATIONS } from "src/constants/permissions.constant";
import { UserRole, InvitationStatus } from "src/enums";
import { db } from "src/database/db";

const inviteUser = async (
  email: string,
  role: string,
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
    invited_by: inviterId,
    token,
    expires_at: expiresAt,
  });

  // Fetch inviter's company name for the invitation email
  const { rows } = await db.raw("SELECT company_name FROM users WHERE id = ?", [
    inviterId,
  ]);
  const inviter = rows[0];

  appEmitter.emit(EVENTS.EMAIL.INVITE, {
    email,
    role,
    token,
    companyName: inviter?.company_name ?? "Artist Management System",
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

  // Get inviter to determine parent_user_id and super_admin_id
  const { rows } = await db.raw("SELECT * FROM users WHERE id = ?", [
    invitation.invited_by,
  ]);
  const inviter = rows[0];
  if (!inviter) {
    throw new NotFoundError("Inviter not found.");
  }

  let superAdminId = null;
  if (inviter.role === UserRole.SUPER_ADMIN) {
    superAdminId = inviter.id;
  } else {
    superAdminId = inviter.super_admin_id;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await db.transaction(async (trx) => {
    const createdUser = await userDao.createUserFromInvitation(
      {
        email: invitation.email,
        password_hash: passwordHash,
        role: invitation.role,
        parent_user_id: inviter.id,
        super_admin_id: superAdminId,
        company_name: inviter.company_name,
      },
      trx,
    );

    await userDao.updateInvitationStatus(
      invitation.id,
      InvitationStatus.ACCEPTED,
      trx,
    );

    return createdUser;
  });

  return user;
};

export const userService = { inviteUser, verifyInvite };
