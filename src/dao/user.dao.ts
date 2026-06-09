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

const createInvitation = async (
  data: ICreateInvitation,
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const { rows } = await client.raw(
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
    `SELECT * FROM invitations WHERE token = ? LIMIT 1`,
    [token],
  );
  return rows[0];
};

const updateInvitationStatus = async (
  id: string,
  status: string,
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const setAcceptedAt =
    status === InvitationStatus.ACCEPTED ? ", accepted_at = NOW()" : "";
  const { rows } = await client.raw(
    `UPDATE invitations SET status = ?${setAcceptedAt}, updated_at = NOW() WHERE id = ? RETURNING *`,
    [status, id],
  );
  return rows[0];
};

const expirePendingInvitationsByEmail = async (
  email: string,
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `UPDATE invitations SET status = ?, updated_at = NOW() WHERE email = ? AND status = ? RETURNING *`,
    [InvitationStatus.EXPIRED, email, InvitationStatus.PENDING],
  );
  return rows;
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
      a.dob AS artist_dob,
      a.gender AS artist_gender,
      a.address AS artist_address,
      a.first_release_year,
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
            dob: row.artist_dob,
            gender: row.artist_gender,
            address: row.artist_address,
            first_release_year: row.first_release_year,
            stage_name: row.stage_name,
            manager_id: row.manager_id,
            artist_manager_name: row.artist_manager_name,
          }
        : null,
    };
  });

  return { total: Number(countRows[0].count), data: formattedData };
};

const findUserById = async (userId: string) => {
  const { rows } = await db.raw(
    `SELECT 
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
      a.dob AS artist_dob,
      a.gender AS artist_gender,
      a.address AS artist_address,
      a.first_release_year,
      CONCAT_WS(' ', c.first_name, c.last_name) AS creator_name,
      c.role AS creator_role,
      CONCAT_WS(' ', m.first_name, m.last_name) AS artist_manager_name
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id AND u.role IN (?, ?)
    LEFT JOIN artists a ON u.id = a.user_id AND u.role = ?
    LEFT JOIN users c ON u.created_by = c.id
    LEFT JOIN users m ON a.manager_id = m.id
    WHERE u.id = ?
    LIMIT 1`,
    [UserRole.SUPER_ADMIN, UserRole.ARTIST_MANAGER, UserRole.ARTIST, userId],
  );

  const row = rows[0];
  if (!row) return null;

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
          dob: row.artist_dob,
          gender: row.artist_gender,
          address: row.artist_address,
          stage_name: row.stage_name,
          manager_id: row.manager_id,
          first_release_year: row.first_release_year,
          artist_manager_name: row.artist_manager_name,
        }
      : null,
  };
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

const findProfileByUserId = async (userId: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    "SELECT * FROM profiles WHERE user_id = ? LIMIT 1",
    [userId],
  );
  return rows[0];
};

const createProfile = async (userId: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `INSERT INTO profiles (user_id) VALUES (?) RETURNING *`,
    [userId],
  );
  return rows[0];
};

const updateProfile = async (
  userId: string,
  data: {
    phone?: string | null;
    dob?: string | null;
    gender?: string | null;
    address?: string | null;
  },
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const updates: string[] = [];
  const params: any[] = [];

  const allowedFields = ["phone", "dob", "gender", "address"];

  for (const field of allowedFields) {
    if (data[field as keyof typeof data] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field as keyof typeof data]);
    }
  }

  if (updates.length === 0) {
    return findProfileByUserId(userId, trx);
  }

  updates.push("updated_at = NOW()");

  const { rows } = await client.raw(
    `UPDATE profiles SET ${updates.join(", ")}
     WHERE user_id = ?
     RETURNING *`,
    [...params, userId],
  );
  return rows[0];
};

const updateUser = async (
  id: string,
  data: { first_name?: string; last_name?: string | null },
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const updates: string[] = [];
  const params: any[] = [];

  const allowedFields = ["first_name", "last_name"];

  for (const field of allowedFields) {
    if (data[field as keyof typeof data] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field as keyof typeof data]);
    }
  }

  if (updates.length === 0) return null;

  updates.push("updated_at = NOW()");
  params.push(id);

  const { rows } = await client.raw(
    `UPDATE users SET ${updates.join(", ")} WHERE id = ? RETURNING *`,
    params,
  );
  return rows[0];
};

const getArtistManagers = async () => {
  const { rows } = await db.raw(
    `SELECT id, CONCAT_WS(' ', first_name, last_name) AS name
     FROM users
     WHERE role = ? AND status = ?
     ORDER BY first_name ASC`,
    [UserRole.ARTIST_MANAGER, UserStatus.ACTIVE],
  );
  return rows;
};

export const userDao = {
  createInvitation,
  findInvitationByEmail,
  findInvitationByToken,
  updateInvitationStatus,
  expirePendingInvitationsByEmail,
  createUserFromInvitation,
  createArtist,
  getUsers,
  findUserById,
  findProfileByUserId,
  createProfile,
  updateProfile,
  findArtistByUserId,
  countUsersCreatedBy,
  deleteUserById,
  softDeleteUser,
  deleteArtistByUserId,
  updateUser,
  getArtistManagers,
};
