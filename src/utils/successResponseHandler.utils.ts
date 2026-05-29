import { Response } from "express";
import { HttpStatusCode } from "../enums/statusCode.enum";

interface SuccessResponse {
  message: string;
  data?: any;
  statusCode?: number;
}

export const sendSuccessResponse = (
  res: Response,
  { message, data = null, statusCode = HttpStatusCode.OK }: SuccessResponse
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
