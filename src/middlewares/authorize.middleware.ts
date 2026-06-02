import { Request, Response, NextFunction } from "express";
import { IPermission, PERMISSIONS } from "src/constants/permissions.constant";
import { HttpStatusCode } from "src/enums";
import { sendFailureResponse } from "src/utils";

export const authorize =
  (permission: IPermission) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = req?.userRole;

    const allowedRoles = PERMISSIONS[permission];

    if (!allowedRoles.includes(role)) {
      sendFailureResponse(res, {
        message: "Forbidden",
        statusCode: HttpStatusCode.FORBIDDEN,
      });
      return;
    }

    next();
  };
