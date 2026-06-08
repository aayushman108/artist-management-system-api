import { db } from "src/database/db";
import { ICreateAlbumInput, IUpdateAlbumInput } from "src/validationSchema";

interface IGetAlbumsParams {
  pageLimit: number;
  pageOffset: number;
  search?: string;
  artistId?: string;
}

const findAlbumById = async (id: string) => {
  const { rows } = await db.raw("SELECT * FROM albums WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0];
};

const findAlbums = async ({
  pageLimit,
  pageOffset,
  search,
  artistId,
}: IGetAlbumsParams) => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push("title ILIKE ?");
    params.push(`%${search}%`);
  }

  if (artistId) {
    conditions.push("artist_id = ?");
    params.push(artistId);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await db.raw(
    `SELECT COUNT(*) AS count FROM albums${where}`,
    params,
  );
  const total = Number(countRows[0].count);

  const { rows: data } = await db.raw(
    `SELECT * FROM albums${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageLimit, pageOffset],
  );

  return { total, data };
};

const createAlbum = async (data: ICreateAlbumInput & { artist_id: string }) => {
  const { rows } = await db.raw(
    `INSERT INTO albums (id, artist_id, title, release_date)
     VALUES (gen_random_uuid(), ?, ?, ?)
     RETURNING *`,
    [data.artist_id, data.title, data.release_date || null],
  );
  return rows[0];
};

const updateAlbum = async (id: string, data: IUpdateAlbumInput) => {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    params.push(data.title);
  }

  if (data.release_date !== undefined) {
    updates.push("release_date = ?");
    params.push(data.release_date);
  }

  if (updates.length === 0) return null;

  updates.push("updated_at = NOW()");
  params.push(id);

  const { rows } = await db.raw(
    `UPDATE albums SET ${updates.join(", ")} WHERE id = ? RETURNING *`,
    params,
  );
  return rows[0];
};

const deleteAlbum = async (id: string) => {
  const { rows } = await db.raw(
    "DELETE FROM albums WHERE id = ? RETURNING id",
    [id],
  );
  return rows[0];
};

const findAlbumsAll = async (artistId?: string) => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (artistId) {
    conditions.push("artist_id = ?");
    params.push(artistId);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await db.raw(
    `SELECT id, title FROM albums${where} ORDER BY title ASC`,
    params,
  );
  return rows;
};

export const albumDao = {
  findAlbumById,
  findAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  findAlbumsAll,
};
