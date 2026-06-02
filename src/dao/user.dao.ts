import { db } from "src/database/db";
import { Knex } from "knex";
import { InvitationStatus } from "src/enums";

export interface ICreateInvitation {
  email: string;
  role: string;
  invited_by: string;
  token: string;
  expires_at: Date;
}

const createInvitation = async (data: ICreateInvitation) => {
  const { rows } = await db.raw(
    `INSERT INTO invitations (email, role, invited_by, token, expires_at)
     VALUES (?, ?, ?, ?, ?)
     RETURNING *`,
    [data.email, data.role, data.invited_by, data.token, data.expires_at],
  );
  return rows[0];
};

const findInvitationByToken = async (token: string) => {
  const { rows } = await db.raw(
    `SELECT * FROM invitations WHERE token = ? AND status = ? LIMIT 1`,
    [token, InvitationStatus.PENDING],
  );
  return rows[0];
};

const updateInvitationStatus = async (id: string, status: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `UPDATE invitations SET status = ?, accepted_at = NOW(), updated_at = NOW() WHERE id = ? RETURNING *`,
    [status, id],
  );
  return rows[0];
};

const createUserFromInvitation = async (
  data: {
    email: string;
    password_hash: string | null;
    role: string;
    parent_user_id: string | null;
    super_admin_id: string | null;
    company_name: string | null;
  },
  trx?: Knex.Transaction
) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `INSERT INTO users (email, password_hash, role, parent_user_id, super_admin_id, company_name, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')
     RETURNING to_jsonb(users) - 'password_hash' AS user`,
    [
      data.email,
      data.password_hash,
      data.role,
      data.parent_user_id,
      data.super_admin_id,
      data.company_name,
    ],
  );
  return rows[0].user;
};

export const userDao = {
  createInvitation,
  findInvitationByToken,
  updateInvitationStatus,
  createUserFromInvitation,
};
