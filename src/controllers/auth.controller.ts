import { Request, Response } from "express";
import { HttpStatusCode, UserStatus } from "src/enums";
import { authService } from "src/services";
import { asyncHandler, sendSuccessResponse } from "src/utils";
import { ISignupInput } from "src/validationSchema";

const signup = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.signup(req.body as ISignupInput);

  return sendSuccessResponse(res, {
    message: "Please check your email to register.",
    data,
    statusCode: HttpStatusCode.CREATED,
  });
});

const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { user } = await authService.verifyEmailVerificationToken(req.body);
  const createdUser = await authService.createUser({
    ...user,
    status: UserStatus.ACTIVE,
  });

  return sendSuccessResponse(res, {
    message: "You are registered successfully.",
    data: createdUser,
    statusCode: HttpStatusCode.CREATED,
  });
});

export const authController = { signup, verifyEmail };
