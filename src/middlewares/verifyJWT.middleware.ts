import { Request, Response, NextFunction } from "express";
import { UnAuthorizedError } from "../utils";
import { authDao } from "../dao";
import { jwtService } from "../services/jwt.service";
import { UserRole } from "src/enums";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeaders = req.headers?.["authorization"];
    if (!authHeaders) {
      throw new UnAuthorizedError();
    }

    const token = authHeaders.split(" ")[1];

    const decoded = jwtService.verifyAccessToken(token) as { id: string };

    if (!decoded?.id) {
      throw new UnAuthorizedError("Unauthorized: Invalid Access Token");
    }

    const user = await authDao.findUserById(decoded.id);

    if (!user) {
      throw new UnAuthorizedError("Unauthorized: Invalid Access Token");
    }

    req.userId = user.id;
    req.role = user.role as UserRole;
    next();
  } catch (err) {
    next(err);
  }
};
