import { Response } from "express";
import { HttpStatusCode } from "../enums/statusCode.enum";

interface IResponse {
  message: string;
  data?: any;
  statusCode?: number;
}

export const sendSuccessResponse = (
  res: Response,
  { message, data = null, statusCode = HttpStatusCode.OK }: IResponse,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendFailureResponse = (
  res: Response,
  { message, data = null, statusCode = HttpStatusCode.BAD_REQUEST }: IResponse,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};
