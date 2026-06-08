import { UserRole, DeleteType, JobType } from "src/enums";
import { artistDao, jobDao } from "src/dao";
import { db } from "src/database/db";
import {
  BadRequestError,
  ConflictError,
  ForbiddentError,
  NotFoundError,
  csvUtil,
} from "src/utils";
import {
  ArtistValidation,
  IUpdateArtistInput,
  IArtistCsvRow,
} from "src/validationSchema";
import { CsvParseError } from "src/utils/csv.util";

const getAll = async (
  page: number,
  limit: number,
  search: string | undefined,
  userId: string,
  userRole: UserRole,
  filterManagerId?: string,
) => {
  const pageOffset = (page - 1) * limit;
  let managerId: string | undefined;

  if (userRole === UserRole.ARTIST_MANAGER) {
    managerId = userId;
  } else if (userRole === UserRole.SUPER_ADMIN && filterManagerId) {
    managerId = filterManagerId;
  }

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

  if (data.manager_id !== undefined && userRole !== UserRole.SUPER_ADMIN) {
    throw new ForbiddentError("Only super admin can assign or change artist manager");
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
      await artistDao.softDeleteUserByArtistId(id, trx);
      await artistDao.deleteArtistById(id, trx);
    });
  } else {
    await artistDao.deleteUserByArtistId(id);
  }
};

const importCsv = async (
  csvContent: string,
  userId: string,
  userRole: UserRole,
) => {
  const { data: validRows, errors: parseErrors } = csvUtil.parseCsv(
    csvContent,
    ArtistValidation.artistCsvRowSchema,
  ) as { data: IArtistCsvRow[]; errors: CsvParseError[] };

  if (parseErrors.length > 0) {
    const previewErrors = parseErrors
      .slice(0, 3)
      .map((e) => `• Row ${e.row}: ${e.message}`)
      .join("\n");

    throw new BadRequestError(
      `We couldn't import the CSV because some rows contain invalid data.\n\n${previewErrors}\n\nPlease correct the CSV and try again.`,
    );
  }

  if (validRows.length === 0) {
    throw new BadRequestError("CSV file contains no valid data rows");
  }

  const emails = validRows.map((row) => row.email);
  const duplicateEmails = emails.filter(
    (email, index) => emails.indexOf(email) !== index,
  );

  if (duplicateEmails.length > 0) {
    throw new ConflictError(
      `Duplicate emails found in CSV: ${[...new Set(duplicateEmails)].join(", ")}`,
    );
  }

  const job = await jobDao.createJob({
    type: JobType.ARTIST_IMPORT,
    data: { rows: validRows, userId, userRole },
    created_by: userId,
  });

  return { jobId: job.id };
};

const exportCsv = async (userId: string, userRole: UserRole) => {
  const managerId = userRole === UserRole.ARTIST_MANAGER ? userId : undefined;

  const artists = await artistDao.findAllArtistsForExport(managerId);

  const columns = [
    { key: "email" as const, header: "Email" },
    { key: "first_name" as const, header: "First Name" },
    { key: "last_name" as const, header: "Last Name" },
    { key: "stage_name" as const, header: "Stage Name" },
    { key: "dob" as const, header: "Date of Birth" },
    { key: "gender" as const, header: "Gender" },
    { key: "address" as const, header: "Address" },
    { key: "first_release_year" as const, header: "First Release Year" },
    { key: "user_status" as const, header: "Status" },
    { key: "created_at" as const, header: "Created At" },
    { key: "updated_at" as const, header: "Updated At" },
  ];

  return csvUtil.generateCsv(artists, columns);
};

export const artistService = {
  getAll,
  getByManagerId,
  getById,
  update,
  delete: deleteArtist,
  importCsv,
  exportCsv,
};
