import { Request } from "express";
import { UserRole } from "src/enums";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: UserRole;
    }
  }
}
