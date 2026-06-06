import { db } from "src/database/db";
import { Knex } from "knex";
import { UserStatus } from "src/enums";

interface IGetArtistsParams {
  pageLimit: number;
  pageOffset: number;
  search?: string;
  managerId?: string;
  gender?: string;
}

const findArtists = async ({
  pageLimit,
  pageOffset,
  search,
  managerId,
}: IGetArtistsParams) => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push(
      "(a.stage_name ILIKE ? OR u.first_name ILIKE ? OR u.last_name ILIKE ?)",
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (managerId) {
    conditions.push("a.manager_id = ?");
    params.push(managerId);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*) AS count
    FROM artists a
    JOIN users u ON a.user_id = u.id
    ${where}
  `;

  const dataQuery = `
    SELECT
      a.id,
      a.user_id,
      a.manager_id,
      a.stage_name,
      a.dob,
      a.gender,
      a.address,
      a.first_release_year,
      a.created_at,
      a.updated_at,
      u.email,
      CONCAT_WS(' ', u.first_name, u.last_name) AS name,
      u.status AS user_status,
      CONCAT_WS(' ', m.first_name, m.last_name) AS manager_name,
      (SELECT COUNT(*) FROM albums WHERE artist_id = a.id) AS no_of_albums,
      (SELECT COUNT(*) FROM musics WHERE artist_id = a.id) AS no_of_musics
    FROM artists a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN users m ON a.manager_id = m.id
    ${where}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [{ rows: countRows }, { rows: dataRows }] = await Promise.all([
    db.raw(countQuery, params),
    db.raw(dataQuery, [...params, pageLimit, pageOffset]),
  ]);

  return { total: Number(countRows[0].count), data: dataRows };
};

const findArtistById = async (id: string) => {
  const { rows } = await db.raw(
    `SELECT
      a.*,
      u.email,
      CONCAT_WS(' ', u.first_name, u.last_name) AS name,
      u.status AS user_status,
      CONCAT_WS(' ', m.first_name, m.last_name) AS manager_name,
      (SELECT COUNT(*) FROM albums WHERE artist_id = a.id) AS no_of_albums,
      (SELECT COUNT(*) FROM musics WHERE artist_id = a.id) AS no_of_musics
    FROM artists a
    JOIN users u ON a.user_id = u.id
    LEFT JOIN users m ON a.manager_id = m.id
    WHERE a.id = ?
    LIMIT 1`,
    [id],
  );
  return rows[0];
};

const findArtistByUserId = async (userId: string) => {
  const { rows } = await db.raw(
    "SELECT * FROM artists WHERE user_id = ? LIMIT 1",
    [userId],
  );
  return rows[0];
};

const updateArtist = async (id: string, data: Record<string, any>) => {
  const updates: string[] = [];
  const params: any[] = [];

  const allowedFields = [
    "stage_name",
    "dob",
    "gender",
    "address",
    "first_release_year",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (updates.length === 0) return null;

  updates.push("updated_at = NOW()");
  params.push(id);

  const { rows } = await db.raw(
    `UPDATE artists SET ${updates.join(", ")} WHERE id = ? RETURNING *`,
    params,
  );
  return rows[0];
};

const deleteArtistById = async (id: string, trx?: Knex.Transaction) => {
  const client = trx || db;
  const { rows } = await client.raw(
    "DELETE FROM artists WHERE id = ? RETURNING id",
    [id],
  );
  return rows[0];
};

const softDeleteUserByArtistId = async (
  artistId: string,
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `UPDATE users SET status = ?, updated_at = NOW() WHERE id = (SELECT user_id FROM artists WHERE id = ?) RETURNING id`,
    [UserStatus.INACTIVE, artistId],
  );
  return rows[0];
};

const deleteUserByArtistId = async (
  artistId: string,
  trx?: Knex.Transaction,
) => {
  const client = trx || db;
  const { rows } = await client.raw(
    `DELETE FROM users WHERE id = (SELECT user_id FROM artists WHERE id = ?) RETURNING id`,
    [artistId],
  );
  return rows[0];
};

export const artistDao = {
  findArtists,
  findArtistById,
  findArtistByUserId,
  updateArtist,
  deleteArtistById,
  softDeleteUserByArtistId,
  deleteUserByArtistId,
};
