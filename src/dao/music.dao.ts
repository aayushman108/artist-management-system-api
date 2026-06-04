import { db } from "src/database/db";
import { ICreateMusicInput, IUpdateMusicInput } from "src/validationSchema";

interface IGetMusicsParams {
  pageLimit: number;
  pageOffset: number;
  search?: string;
  artistId?: string;
  albumId?: string;
}

const findMusicById = async (id: string) => {
  const { rows } = await db.raw("SELECT * FROM musics WHERE id = ? LIMIT 1", [
    id,
  ]);
  return rows[0];
};

const findMusics = async ({
  pageLimit,
  pageOffset,
  search,
  artistId,
  albumId,
}: IGetMusicsParams) => {
  const conditions: string[] = [];
  const params: any[] = [];

  if (search) {
    conditions.push("(title ILIKE ? OR genre ILIKE ? OR language ILIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (artistId) {
    conditions.push("artist_id = ?");
    params.push(artistId);
  }

  if (albumId) {
    conditions.push("album_id = ?");
    params.push(albumId);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await db.raw(
    `SELECT COUNT(*) AS count FROM musics${where}`,
    params,
  );
  const total = Number(countRows[0].count);

  const { rows: data } = await db.raw(
    `SELECT * FROM musics${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageLimit, pageOffset],
  );

  return { total, data };
};

const createMusic = async (data: ICreateMusicInput & { artist_id: string }) => {
  const { rows } = await db.raw(
    `INSERT INTO musics (id, artist_id, title, album_id, genre, language, release_date)
     VALUES (gen_random_uuid(), ?, ?, ?::uuid, ?, ?, ?)
     RETURNING *`,
    [
      data.artist_id,
      data.title,
      data.album_id || null,
      data.genre || null,
      data.language || null,
      data.release_date || null,
    ],
  );
  return rows[0];
};

const updateMusic = async (id: string, data: IUpdateMusicInput) => {
  const updates: string[] = [];
  const params: any[] = [];

  if (data.title !== undefined) {
    updates.push("title = ?");
    params.push(data.title);
  }

  if (data.album_id !== undefined) {
    updates.push("album_id = ?::uuid");
    params.push(data.album_id);
  }

  if (data.genre !== undefined) {
    updates.push("genre = ?");
    params.push(data.genre);
  }

  if (data.language !== undefined) {
    updates.push("language = ?");
    params.push(data.language);
  }

  if (data.release_date !== undefined) {
    updates.push("release_date = ?");
    params.push(data.release_date);
  }

  if (updates.length === 0) return null;

  updates.push("updated_at = NOW()");
  params.push(id);

  const { rows } = await db.raw(
    `UPDATE musics SET ${updates.join(", ")} WHERE id = ? RETURNING *`,
    params,
  );
  return rows[0];
};

const deleteMusic = async (id: string) => {
  const { rows } = await db.raw(
    "DELETE FROM musics WHERE id = ? RETURNING id",
    [id],
  );
  return rows[0];
};

export const musicDao = {
  findMusicById,
  findMusics,
  createMusic,
  updateMusic,
  deleteMusic,
};
