import { UserRole, DeleteType } from "src/enums";
import { artistDao } from "src/dao/artist.dao";
import { db } from "src/database/db";
import { BadRequestError, ForbiddentError, NotFoundError } from "src/utils";
import { IUpdateArtistInput } from "src/validationSchema";

const getAll = async (
  page: number,
  limit: number,
  search: string | undefined,
  userId: string,
  userRole: UserRole,
) => {
  const pageOffset = (page - 1) * limit;
  const managerId = userRole === UserRole.ARTIST_MANAGER ? userId : undefined;

  return await artistDao.findArtists({
    pageLimit: limit,
    pageOffset,
    search,
    managerId,
  });
};

const getByManagerId = async (
  managerId: string,
  page: number,
  limit: number,
  search: string | undefined,
  userRole: UserRole,
) => {
  if (userRole !== UserRole.SUPER_ADMIN) {
    throw new ForbiddentError("Only super admin can view artists by manager");
  }

  const pageOffset = (page - 1) * limit;

  return await artistDao.findArtists({
    pageLimit: limit,
    pageOffset,
    search,
    managerId,
  });
};

const getById = async (id: string, userId: string, userRole: UserRole) => {
  const artist = await artistDao.findArtistById(id);
  if (!artist) throw new NotFoundError("Artist not found");

  if (userRole === UserRole.ARTIST_MANAGER && artist.manager_id !== userId) {
    throw new ForbiddentError("You can only view artists managed by you");
  }

  return artist;
};

const update = async (
  id: string,
  data: IUpdateArtistInput,
  userId: string,
  userRole: UserRole,
) => {
  const artist = await artistDao.findArtistById(id);
  if (!artist) throw new NotFoundError("Artist not found");

  if (userRole === UserRole.ARTIST_MANAGER && artist.manager_id !== userId) {
    throw new ForbiddentError("You can only update artists managed by you");
  }

  const updated = await artistDao.updateArtist(id, data);
  return updated;
};

const deleteArtist = async (
  id: string,
  userId: string,
  userRole: UserRole,
  deleteType?: DeleteType,
) => {
  const artist = await artistDao.findArtistById(id);
  if (!artist) throw new NotFoundError("Artist not found");

  if (userRole === UserRole.ARTIST_MANAGER) {
    if (artist.manager_id !== userId) {
      throw new ForbiddentError("You can only delete artists managed by you");
    }
    if (!deleteType || deleteType === DeleteType.HARD) {
      throw new BadRequestError("Artist managers can only soft delete artists");
    }
  }

  const type = deleteType || DeleteType.HARD;

  if (type === DeleteType.SOFT) {
    await db.transaction(async (trx) => {
      await artistDao.deleteArtistById(id, trx);
      await artistDao.softDeleteUserByArtistId(id, trx);
    });
  } else {
    await artistDao.deleteUserByArtistId(id);
  }
};

export const artistService = {
  getAll,
  getByManagerId,
  getById,
  update,
  delete: deleteArtist,
};
