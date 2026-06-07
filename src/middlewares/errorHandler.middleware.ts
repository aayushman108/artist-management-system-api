import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpStatusCode } from "../enums/statusCode.enum";
import { BaseError } from "../utils/baseError.util";
import { JsonWebTokenError } from "jsonwebtoken";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
): any {
  if (error instanceof BaseError) {
    error.handleError(res);
  } else if (error instanceof JsonWebTokenError) {
    return res.status(HttpStatusCode.UNAUTHORIZED).json({
      success: false,
      message: error.message,
      data: null,
    });
  } else if (error instanceof MulterError || error?.code === "LIMIT_FILE_SIZE") {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: error.message || "File upload error",
      data: null,
    });
  } else {
    console.error(error, "Error from error handler");
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
}
