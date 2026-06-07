import express from "express";
import { jobController } from "src/controllers";
import { verifyJWT } from "src/middlewares";

export const jobRouter = express.Router();

jobRouter.use(verifyJWT);

jobRouter.get("/:jobId", jobController.getJobStatus);
