import { Request, Response } from "express";
import { UserRole } from "src/enums";
import { jobService } from "src/services/job.service";
import { asyncHandler, sendSuccessResponse } from "src/utils";

const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const job = await jobService.getJob(jobId, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Job fetched successfully",
    data: job,
  });
});

export const jobController = { getJobStatus };
