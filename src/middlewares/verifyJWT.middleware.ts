import { Request, Response, NextFunction } from "express";
import { NotFoundError, UnAuthorizedError } from "../utils";
import { authDao } from "../dao";
import { jwtService } from "../services/jwt.service";

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    const user = await authDao.findById(decoded.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    req.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
};
