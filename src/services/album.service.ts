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

async function getMyAlbums(query: {
  page?: number;
  limit?: number;
  search?: string;
  userId: string;
  all?: boolean;
}) {
  const { page, limit, search, userId, all } = query;

  const artist = await userDao.findArtistByUserId(userId);
  if (!artist) throw new NotFoundError("Artist profile not found");

  if (all) {
    const albums = await albumDao.findAlbumsAll(artist.id);
    return albums;
  }

  const pageNumber = page || 1;
  const pageLimit = limit || 10;
  const pageOffset = (pageNumber - 1) * pageLimit;

  const result = await albumDao.findAlbums({
    pageLimit,
    pageOffset,
    search,
    artistId: artist.id,
  });
  return result;
}

async function getAlbumByArtistId(query: {
  page?: number;
  limit?: number;
  search?: string;
  artistId: string;
  all?: boolean;
}) {
  const { page, limit, search, artistId, all } = query;

  if (all) {
    const albums = await albumDao.findAlbumsAll(artistId);
    return albums;
  }

  const pageNumber = page || 1;
  const pageLimit = limit || 10;
  const pageOffset = (pageNumber - 1) * pageLimit;

  const result = await albumDao.findAlbums({
    pageLimit,
    pageOffset,
    search,
    artistId,
  });
  return result;
}

export const albumService = {
  create,
  update,
  delete: deleteAlbum,
  getMyAlbums,
  getAlbumByArtistId,
};
