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
    conditions.push(
      "(m.title ILIKE ? OR m.genre ILIKE ? OR m.language ILIKE ?)",
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (artistId) {
    conditions.push("m.artist_id = ?");
    params.push(artistId);
  }

  if (albumId) {
    if (albumId === "none") {
      conditions.push("m.album_id IS NULL");
    } else {
      conditions.push("m.album_id = ?");
      params.push(albumId);
    }
  }

  const where = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";

  const { rows: countRows } = await db.raw(
    `SELECT COUNT(*) AS count FROM musics m LEFT JOIN artists art ON m.artist_id = art.id LEFT JOIN users u ON art.user_id = u.id LEFT JOIN albums alb ON m.album_id = alb.id${where}`,
    params,
  );
  const total = Number(countRows[0].count);

  const { rows: data } = await db.raw(
    `SELECT 
    m.*, 
    CONCAT_WS(' ', u.first_name, u.last_name) AS artist_name, 
    alb.title AS album_title 
    FROM musics m 
    LEFT JOIN artists art ON m.artist_id = art.id 
    LEFT JOIN users u ON art.user_id = u.id 
    LEFT JOIN albums alb ON m.album_id = alb.id
    ${where} 
    ORDER BY m.created_at DESC LIMIT ? OFFSET ?`,
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

  const allowedFields = ["title", "album_id", "genre", "language", "release_date"];

  for (const field of allowedFields) {
    if (data[field as keyof IUpdateMusicInput] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(data[field as keyof IUpdateMusicInput]);
    }
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
