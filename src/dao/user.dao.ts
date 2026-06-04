import { db } from "src/database/db";
import { Knex } from "knex";
import { InvitationStatus, UserStatus, UserRole } from "src/enums";

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

const findInvitationByEmail = async (email: string) => {
  const { rows } = await db.raw(
    `SELECT * FROM invitations WHERE email = ? AND status = ? AND expires_at >= NOW() LIMIT 1`,
    [email, InvitationStatus.PENDING],
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

const getUsers = async (
  limit: number,
  offset: number,
  search?: string,
  role?: string,
  status?: string,
) => {
  const queryParams: any[] = [];
  const whereClauses: string[] = [];

  if (search) {
    whereClauses.push(
      `(u.email ILIKE ? OR u.first_name ILIKE ? OR u.last_name ILIKE ?)`,
    );
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (role) {
    whereClauses.push(`u.role = ?`);
    queryParams.push(role);
  }

  if (status) {
    whereClauses.push(`u.status = ?`);
    queryParams.push(status);
  }

  const whereString =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(u.id) AS count
    FROM users u
    ${whereString}
  `;

  const dataQuery = `
    SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.status,
      u.created_at,
      u.created_by,
      p.dob,
      p.gender,
      p.address,
      p.phone,
      p.avatar,
      a.stage_name,
      a.manager_id,
      CONCAT_WS(' ', c.first_name, c.last_name) AS creator_name,
      c.role AS creator_role,
      CONCAT_WS(' ', m.first_name, m.last_name) AS artist_manager_name
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id AND u.role IN (?, ?)
    LEFT JOIN artists a ON u.id = a.user_id AND u.role = ?
    LEFT JOIN users c ON u.created_by = c.id
    LEFT JOIN users m ON a.manager_id = m.id
    ${whereString}
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const dataParams = [
    UserRole.SUPER_ADMIN,
    UserRole.ARTIST_MANAGER,
    UserRole.ARTIST,
    ...queryParams,
    limit,
    offset,
  ];

  const [{ rows: countRows }, { rows: dataRows }] = await Promise.all([
    db.raw(countQuery, queryParams),
    db.raw(dataQuery, dataParams),
  ]);

  const formattedData = dataRows.map((row: any) => {
    const hasProfile =
      row.role === UserRole.SUPER_ADMIN || row.role === UserRole.ARTIST_MANAGER;
    const isArtist = row.role === UserRole.ARTIST;

    return {
      user: {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role,
        status: row.status,
        created_at: row.created_at,
        created_by: row.created_by,
        creator_name: row.creator_name,
        creator_role: row.creator_role,
      },
      profile: hasProfile
        ? {
            dob: row.dob,
            gender: row.gender,
            address: row.address,
            phone: row.phone,
            avatar: row.avatar,
          }
        : null,
      artist: isArtist
        ? {
            stage_name: row.stage_name,
            manager_id: row.manager_id,
            artist_manager_name: row.artist_manager_name,
          }
        : null,
    };
  });

  return { total: Number(countRows[0].count), data: formattedData };
};

const findArtistByUserId = async (userId: string) => {
  const { rows } = await db.raw(
    "SELECT * FROM artists WHERE user_id = ? LIMIT 1",
    [userId],
  );
  return rows[0];
};

const countUsersCreatedBy = async (userId: string) => {
  const { rows } = await db.raw(
    "SELECT COUNT(*) AS count FROM users WHERE created_by = ?",
    [userId],
  );
  return Number(rows[0].count);
};

const deleteUserById = async (id: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    "DELETE FROM users WHERE id = ? RETURNING id",
    [id],
  );
  return rows[0];
};

const softDeleteUser = async (id: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `UPDATE users SET status = ?, updated_at = NOW() WHERE id = ? RETURNING to_jsonb(users) - 'password_hash' AS user`,
    [UserStatus.INACTIVE, id],
  );
  return rows[0]?.user;
};

const deleteArtistByUserId = async (userId: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    "DELETE FROM artists WHERE user_id = ? RETURNING id",
    [userId],
  );
  return rows[0];
};

export const userDao = {
  createInvitation,
  findInvitationByEmail,
  findInvitationByToken,
  updateInvitationStatus,
  createUserFromInvitation,
  createArtist,
  getUsers,
  findArtistByUserId,
  countUsersCreatedBy,
  deleteUserById,
  softDeleteUser,
  deleteArtistByUserId,
};
