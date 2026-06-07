import bcrypt from "bcrypt";
import crypto from "crypto";
import { JobStatus, JobType, UserRole, UserStatus } from "src/enums";
import { artistDao, jobDao } from "src/dao";
import { db } from "src/database/db";
import { NotFoundError } from "src/utils";

const getJob = async (jobId: string, userId: string, userRole: UserRole) => {
  const job = await jobDao.findJobById(jobId);
  if (!job) throw new NotFoundError("Job not found");

  if (userRole === UserRole.ARTIST_MANAGER && job.created_by !== userId) {
    throw new NotFoundError("Job not found");
  }

  const { data, ...rest } = job;
  return rest;
};

const processArtistImport = async (jobId: string) => {
  const job = await jobDao.findJobById(jobId);
  if (!job) throw new Error("Job not found");

  const { rows, userId, userRole } = job.data;
  if (!rows || !userId) throw new Error("Invalid job data");

  const total = rows.length;

  await jobDao.updateJob(jobId, { progress: 0, total });

  const emails = rows.map((row: any) => row.email);
  const placeholders = emails.map(() => "?").join(",");

  const { rows: existingUsers } = await db.raw(
    `SELECT email FROM users WHERE email IN (${placeholders})`,
    emails,
  );

  const existingSet = new Set(existingUsers.map((user: any) => user.email));

  const filteredRows = rows.filter((row: any) => !existingSet.has(row.email));
  let skipped = total - filteredRows.length;

  if (filteredRows.length === 0) {
    await jobDao.updateJob(jobId, {
      status: JobStatus.COMPLETED,
      progress: 100,
      result: { imported: 0, skipped },
    });
    return;
  }

  const hashedRows = await Promise.all(
    filteredRows.map(async (row: any) => ({
      row,
      passwordHash: await bcrypt.hash(crypto.randomUUID(), 10),
    })),
  );

  await jobDao.updateJob(jobId, { progress: 30 });

  let imported = 0;

  await db.transaction(async (trx) => {
    for (const { row, passwordHash } of hashedRows) {
      const user = await artistDao.createUserForImport(
        {
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          password_hash: passwordHash,
          role: UserRole.ARTIST,
          status: UserStatus.MIGRATED,
          created_by: userId,
        },
        trx,
      );

      if (!user) {
        skipped++;
        continue;
      }

      const managerId =
        userRole === UserRole.ARTIST_MANAGER ? userId : null;

      await artistDao.createArtistForImport(
        {
          user_id: user.id,
          manager_id: managerId,
          stage_name: row.stage_name,
          dob: row.dob,
          gender: row.gender,
          address: row.address,
          first_release_year: row.first_release_year,
        },
        trx,
      );

      imported++;
    }
  });

  await jobDao.updateJob(jobId, {
    status: JobStatus.COMPLETED,
    progress: 100,
    result: { imported, skipped },
  });
};

const processJob = async (jobId: string, jobType: string) => {
  try {
    switch (jobType) {
      case JobType.ARTIST_IMPORT:
        await processArtistImport(jobId);
        break;
      default:
        await jobDao.updateJob(jobId, {
          status: JobStatus.FAILED,
          error: `Unknown job type: ${jobType}`,
        });
    }
  } catch (error: any) {
    const isDbError = typeof error.code === "string" && error.code.length === 5;
    await jobDao.updateJob(jobId, {
      status: JobStatus.FAILED,
      error: isDbError
        ? "Internal server error"
        : error.message || "Job processing failed",
    });
  }
};

export const jobService = { getJob, processJob };
