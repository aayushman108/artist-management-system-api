import { UserRole } from "src/enums";
import { albumDao, userDao } from "src/dao";
import { BadRequestError, ForbiddentError, NotFoundError } from "src/utils";
import { ICreateAlbumInput, IUpdateAlbumInput } from "src/validationSchema";

async function create(
  data: ICreateAlbumInput,
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

  const album = await albumDao.createAlbum({ ...data, artist_id: artistId! });
  return album;
}

async function update(
  id: string,
  data: IUpdateAlbumInput,
  userId: string,
  userRole: UserRole,
) {
  const album = await albumDao.findAlbumById(id);
  if (!album) throw new NotFoundError("Album not found");

  if (userRole === UserRole.ARTIST) {
    const artist = await userDao.findArtistByUserId(userId);
    if (!artist || artist.id !== album.artist_id) {
      throw new ForbiddentError("You can only update your own albums");
    }
  }

  const updated = await albumDao.updateAlbum(id, data);
  return updated;
}

async function deleteAlbum(id: string, userId: string, userRole: UserRole) {
  const album = await albumDao.findAlbumById(id);
  if (!album) throw new NotFoundError("Album not found");

  if (userRole === UserRole.ARTIST) {
    const artist = await userDao.findArtistByUserId(userId);
    if (!artist || artist.id !== album.artist_id) {
      throw new ForbiddentError("You can only delete your own albums");
    }
  }

  const deleted = await albumDao.deleteAlbum(id);
  return deleted;
}

async function getAll(query: {
  page: number;
  limit: number;
  search?: string;
  artistId?: string;
}) {
  const { page, limit, search, artistId } = query;
  const pageOffset = (page - 1) * limit;

  const result = await albumDao.findAlbums({
    pageLimit: limit,
    pageOffset,
    search,
    artistId,
  });
  return result;
}

export const albumService = { create, update, delete: deleteAlbum, getAll };
