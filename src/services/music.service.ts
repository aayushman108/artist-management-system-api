import { UserRole } from "src/enums";
import { musicDao, userDao } from "src/dao";
import { BadRequestError, ForbiddentError, NotFoundError } from "src/utils";
import { ICreateMusicInput, IUpdateMusicInput } from "src/validationSchema";

async function create(
  data: ICreateMusicInput,
  userId: string,
  userRole: UserRole,
) {
  let artistId = data.artist_id;

  if (userRole === UserRole.SUPER_ADMIN) {
    if (!artistId) throw new BadRequestError("artistId is required");
  } else if (userRole === UserRole.ARTIST) {
    const artist = await userDao.findArtistByUserId(userId);
    if (!artist) throw new NotFoundError("Artist profile not found");
    artistId = artist.id;
  }

  const music = await musicDao.createMusic({ ...data, artist_id: artistId! });
  return music;
}

async function update(
  id: string,
  data: IUpdateMusicInput,
  userId: string,
  userRole: UserRole,
) {
  const music = await musicDao.findMusicById(id);
  if (!music) throw new NotFoundError("Music not found");

  if (userRole === UserRole.ARTIST) {
    const artist = await userDao.findArtistByUserId(userId);
    if (!artist || artist.id !== music.artist_id) {
      throw new ForbiddentError("You can only update your own music");
    }
  }

  const updated = await musicDao.updateMusic(id, data);
  return updated;
}

async function deleteMusic(id: string, userId: string, userRole: UserRole) {
  const music = await musicDao.findMusicById(id);
  if (!music) throw new NotFoundError("Music not found");

  if (userRole === UserRole.ARTIST) {
    const artist = await userDao.findArtistByUserId(userId);
    if (!artist || artist.id !== music.artist_id) {
      throw new ForbiddentError("You can only delete your own music");
    }
  }

  const deleted = await musicDao.deleteMusic(id);
  return deleted;
}

async function getAll(query: {
  page: number;
  limit: number;
  search?: string;
  artistId?: string;
  albumId?: string;
}) {
  const { page, limit, search, artistId, albumId } = query;
  const pageOffset = (page - 1) * limit;

  const result = await musicDao.findMusics({
    pageLimit: limit,
    pageOffset,
    search,
    artistId,
    albumId,
  });
  return result;
}

async function getMusicsByArtistId(query: {
  page: number;
  limit: number;
  search?: string;
  artistId: string;
  albumId?: string;
}) {
  const { page, limit, search, artistId, albumId } = query;
  const pageOffset = (page - 1) * limit;

  const result = await musicDao.findMusics({
    pageLimit: limit,
    pageOffset,
    search,
    artistId,
    albumId,
  });
  return result;
}

async function getMyMusics(query: {
  page: number;
  limit: number;
  search?: string;
  userId: string;
  albumId?: string;
}) {
  const { page, limit, search, userId, albumId } = query;

  const artist = await userDao.findArtistByUserId(userId);
  if (!artist) throw new NotFoundError("Artist profile not found");

  const pageOffset = (page - 1) * limit;

  const result = await musicDao.findMusics({
    pageLimit: limit,
    pageOffset,
    search,
    artistId: artist.id,
    albumId,
  });
  return result;
}

export const musicService = { create, update, delete: deleteMusic, getAll, getMusicsByArtistId, getMyMusics };
