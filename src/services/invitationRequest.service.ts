import crypto from "crypto";
import { invitationRequestDao } from "src/dao/invitationRequest.dao";
import { userDao } from "src/dao";
import { authDao } from "src/dao";
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  appEmitter,
  EVENTS,
} from "src/utils";
import { ICreateInvitationRequestInput } from "src/validationSchema";
import { InvitationRequestStatus } from "src/enums";
import { db } from "src/database/db";

async function create(data: ICreateInvitationRequestInput) {
  const existingUser = await authDao.findByEmail(data.email);
  if (existingUser) {
    throw new ConflictError("A user with this email already exists.");
  }

  const existingInvitation = await userDao.findInvitationByEmail(data.email);
  if (existingInvitation) {
    throw new ConflictError("An invitation for this email already exists.");
  }

  const pendingRequest = await invitationRequestDao.findPendingRequestByEmail(
    data.email,
  );
  if (pendingRequest) {
    throw new ConflictError("A pending request for this email already exists.");
  }

  const request = await invitationRequestDao.createRequest(data);

  return request;
}

async function getAll(page: number, limit: number, status?: string) {
  const pageOffset = (page - 1) * limit;

  return await invitationRequestDao.findRequests({
    pageLimit: limit,
    pageOffset,
    status,
  });
}

async function invite(id: string, adminId: string) {
  const request = await invitationRequestDao.findRequestById(id);
  if (!request) {
    throw new NotFoundError("Invitation request not found.");
  }
  if (request.status !== InvitationRequestStatus.PENDING) {
    throw new BadRequestError("Only pending requests can be invited.");
  }

  const existingUser = await authDao.findByEmail(request.email);
  if (existingUser) {
    throw new ConflictError("A user with this email already exists.");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresInDays = 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await db.transaction(async (trx) => {
    await trx.raw(
      `UPDATE invitation_requests SET status = ?, updated_at = NOW() WHERE id = ?`,
      [InvitationRequestStatus.INVITED, id],
    );

    await trx.raw(
      `INSERT INTO invitations (email, role, first_name, last_name, invited_by, token, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        request.email,
        request.role,
        request.first_name,
        request.last_name,
        adminId,
        token,
        expiresAt,
      ],
    );
  });

  const { rows } = await db.raw(
    "SELECT first_name, last_name FROM users WHERE id = ?",
    [adminId],
  );
  const admin = rows[0];

  appEmitter.emit(EVENTS.EMAIL.INVITE, {
    email: request.email,
    role: request.role,
    token,
    inviterName: [admin?.first_name, admin?.last_name]
      .filter(Boolean)
      .join(" "),
    expiresInDays,
  });

  return { message: "Invitation sent successfully." };
}

async function updateStatus(id: string, status: InvitationRequestStatus) {
  const request = await invitationRequestDao.findRequestById(id);
  if (!request) {
    throw new NotFoundError("Invitation request not found.");
  }

  if (request.status === status) {
    throw new BadRequestError(
      `Request is already in "${status}" status.`,
    );
  }

  const updated = await invitationRequestDao.updateRequestStatus(id, status);
  return updated;
}

async function remove(id: string) {
  const request = await invitationRequestDao.findRequestById(id);
  if (!request) {
    throw new NotFoundError("Invitation request not found.");
  }

  await invitationRequestDao.deleteRequest(id);
  return { message: "Request deleted successfully." };
}

export const invitationRequestService = {
  create,
  getAll,
  invite,
  updateStatus,
  remove,
};
