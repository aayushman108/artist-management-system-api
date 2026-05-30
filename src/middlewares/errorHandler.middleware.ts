import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enums/statusCode.enum";
import { BaseError } from "../utils/baseError.util";
import { JsonWebTokenError } from "jsonwebtoken";

export function errorHandler(
  error: ErrorRequestHandler,
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
  } else {
    console.log(error, "Error from error handler");
    return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
}
