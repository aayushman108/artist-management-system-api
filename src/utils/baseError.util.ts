import { Response } from "express";
import { HttpStatusCode } from "../enums/statusCode.enum";

export class BaseError extends Error {
  public status: HttpStatusCode;
  constructor(statusCode: HttpStatusCode, message: string) {
    super(message);
    this.status = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
  handleError(res: Response) {
    return res.status(this.status).json({ message: this.message });
  }
}
