import { db } from "src/database/db";
import { JobStatus, JobType } from "src/enums";

interface ICreateJob {
  type: JobType;
  data?: any;
  created_by: string;
}

interface IUpdateJob {
  status?: JobStatus;
  progress?: number;
  total?: number;
  result?: any;
  error?: string;
}

const createJob = async (data: ICreateJob) => {
  const { rows } = await db.raw(
    `INSERT INTO jobs (type, status, data, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, NOW(), NOW()) RETURNING *`,
    [data.type, JobStatus.PENDING, data.data ? JSON.stringify(data.data) : null, data.created_by],
  );
  return rows[0];
};

const updateJob = async (id: string, data: IUpdateJob) => {
  const sets: string[] = [];
  const params: any[] = [];

  if (data.status !== undefined) {
    sets.push("status = ?");
    params.push(data.status);
  }
  if (data.progress !== undefined) {
    sets.push("progress = ?");
    params.push(data.progress);
  }
  if (data.total !== undefined) {
    sets.push("total = ?");
    params.push(data.total);
  }
  if (data.result !== undefined) {
    sets.push("result = ?");
    params.push(JSON.stringify(data.result));
  }
  if (data.error !== undefined) {
    sets.push("error = ?");
    params.push(data.error);
  }

  if (sets.length === 0) return null;

  sets.push("updated_at = NOW()");
  params.push(id);

  const { rows } = await db.raw(
    `UPDATE jobs SET ${sets.join(", ")} WHERE id = ? RETURNING *`,
    params,
  );
  return rows[0];
};

const findJobById = async (id: string) => {
  const { rows } = await db.raw(
    "SELECT * FROM jobs WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0];
};

export const jobDao = { createJob, updateJob, findJobById };
