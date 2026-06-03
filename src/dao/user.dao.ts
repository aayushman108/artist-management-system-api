import { db } from "src/database/db";
import { Knex } from "knex";
import { InvitationStatus, UserStatus } from "src/enums";

export interface ICreateInvitation {
  email: string;
  role: string;
  first_name: string;
  last_name: string | null;
  invited_by: string;
  token: string;
  expires_at: Date;
}

const createInvitation = async (data: ICreateInvitation) => {
  const { rows } = await db.raw(
    `INSERT INTO invitations (email, role, first_name, last_name, invited_by, token, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     RETURNING *`,
    [
      data.email,
      data.role,
      data.first_name,
      data.last_name,
      data.invited_by,
      data.token,
      data.expires_at,
    ],
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

const updateInvitationStatus = async (
  id: string,
  status: string,
  trx?: Knex.Transaction,
) => {
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
    first_name: string;
    last_name: string | null;
    created_by: string | null;
  },
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `INSERT INTO users (email, password_hash, role, first_name, last_name, created_by, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     RETURNING to_jsonb(users) - 'password_hash' AS user`,
    [
      data.email,
      data.password_hash,
      data.role,
      data.first_name,
      data.last_name,
      data.created_by,
      UserStatus.ACTIVE,
    ],
  );
  return rows[0].user;
};

const createArtist = async (
  data: {
    userId: string;
    managerId: string | null;
    stageName: string;
  },
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `INSERT INTO artists (user_id, manager_id, stage_name) VALUES (?, ?, ?) RETURNING *`,
    [data.userId, data.managerId, data.stageName],
  );
  return rows[0];
};

export const userDao = {
  createInvitation,
  findInvitationByToken,
  updateInvitationStatus,
  createUserFromInvitation,
  createArtist,
};
