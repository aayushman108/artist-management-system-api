import { HttpStatusCode } from "../enums/statusCode.enum";
import { BaseError } from "./baseError.util";

export class ConflictError extends BaseError {
  constructor(message: string = "Conflict") {
    super(HttpStatusCode.CONFLICT, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string = "Resource not found!") {
    super(HttpStatusCode.NOT_FOUND, message);
  }
}

export class UnAuthorizedError extends BaseError {
  constructor(message: string = "Unauthorized Access") {
    super(HttpStatusCode.UNAUTHORIZED, message);
  }
}

export class InterServerError extends BaseError {
  constructor(message: string = "Internal Server Error") {
    super(HttpStatusCode.INTERNAL_SERVER_ERROR, message);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string = "Bad request error") {
    super(HttpStatusCode.BAD_REQUEST, message);
  }
}

export class ForbiddentError extends BaseError {
  constructor(message: string = "Forbidden") {
    super(HttpStatusCode.FORBIDDEN, message);
  }
}
