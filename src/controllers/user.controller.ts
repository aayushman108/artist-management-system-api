import { Request, Response } from "express";
import { HttpStatusCode, UserRole } from "src/enums";
import { sendSuccessResponse } from "src/utils";
import { asyncHandler } from "src/utils/asyncHandler";
import { userService } from "src/services/user.service";

const inviteUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, role, firstName, lastName } = req.body;
  const inviterId = req.userId as string;
  const inviterRole = req.userRole as UserRole;

  await userService.inviteUser(
    email,
    role,
    firstName,
    lastName,
    inviterId,
    inviterRole,
  );

  return sendSuccessResponse(res, {
    message: "Invitation sent successfully.",
    data: null,
    statusCode: HttpStatusCode.CREATED,
  });
});

const verifyInvite = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await userService.verifyInvite(token, password);

  return sendSuccessResponse(res, {
    message: "Invitation verified and user created successfully.",
    data: user,
    statusCode: HttpStatusCode.CREATED,
  });
});

export const userController = { inviteUser, verifyInvite };
