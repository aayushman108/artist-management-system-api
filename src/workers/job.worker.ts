import { db } from "src/database/db";
import { jobService } from "src/services/job.service";
import { JobStatus } from "src/enums";

const POLL_INTERVAL_MS = 5000;
const STALE_THRESHOLD_S = 30;

let intervalHandle: ReturnType<typeof setInterval> | null = null;

const processPendingJobs = async () => {
  try {
    const { rows: jobs } = await db.raw(
      `SELECT id, type, status FROM jobs
       WHERE (status = ?)
          OR (status = ? AND updated_at < NOW() - ?::integer * INTERVAL '1 second')
       ORDER BY created_at ASC
       LIMIT 5`,
      [JobStatus.PENDING, JobStatus.PROCESSING, STALE_THRESHOLD_S],
    );

    for (const job of jobs) {
      if (job.status === JobStatus.PENDING) {
        const { rows: claimed } = await db.raw(
          `UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ? AND status = ? RETURNING id`,
          [JobStatus.PROCESSING, job.id, JobStatus.PENDING],
        );
        if (claimed.length === 0) continue;
      }

      await jobService.processJob(job.id, job.type);
    }
  } catch (error) {
    console.error("Job worker error:", error);
  }
};

export const initJobWorker = () => {
  console.log("Job worker started (polling every 5s)");
  intervalHandle = setInterval(processPendingJobs, POLL_INTERVAL_MS);
};

export const stopJobWorker = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
};
