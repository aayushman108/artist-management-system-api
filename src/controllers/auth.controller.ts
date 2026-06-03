import { Request, Response } from "express";
import { cookieOptions } from "src/config/cookie.config";
import { ENV } from "src/constants";
import { HttpStatusCode, UserStatus } from "src/enums";
import { authService, jwtService } from "src/services";
import {
  asyncHandler,
  sendFailureResponse,
  sendSuccessResponse,
  UnAuthorizedError,
} from "src/utils";
import { ILoginInput, ISignupInput } from "src/validationSchema";

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

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as ILoginInput;

  const user = await authService.login({ email, password });

  const accessToken = jwtService.generateAccessToken(user);

  const refreshToken = jwtService.generateRefreshToken(user);

  res.cookie("jwt", refreshToken, {
    ...cookieOptions,
    maxAge:
      Number(ENV.REFRESH_TOKEN_EXPIRY?.trim()?.slice(0, -1)) *
      24 *
      60 *
      60 *
      1000,
  });

  return sendSuccessResponse(res, {
    message: "Successfully logged in",
    data: { user: { ...user, password_hash: undefined }, accessToken },
    statusCode: HttpStatusCode.OK,
  });
});

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    throw new UnAuthorizedError();
  }

  const refreshToken = cookies.jwt;

  const { accessToken, user } = await authService.refresh(refreshToken);

  return sendSuccessResponse(res, {
    message: "Token refreshed successfully.",
    data: { accessToken, user },
    statusCode: HttpStatusCode.OK,
  });
});

const logout = asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    sendFailureResponse(res, {
      message: "No content available",
      statusCode: HttpStatusCode.NO_CONTENT,
    });
    return;
  }

  const refreshToken = cookies.jwt;

  await authService.logout(refreshToken);

  res.clearCookie("jwt", {
    ...cookieOptions,
  });

  return sendSuccessResponse(res, {
    message: "Successfully logged out.",
    statusCode: HttpStatusCode.OK,
  });
});

const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const user = await authService.getMe(userId);

  return sendSuccessResponse(res, {
    message: "User fetched successfully",
    data: user,
    statusCode: HttpStatusCode.OK,
  });
});

const checkSignupEligibility = asyncHandler(
  async (_req: Request, res: Response) => {
    const result = await authService.checkSignupEligibility();

    return sendSuccessResponse(res, {
      message: result.message,
      data: { isSignupAllowed: result.isSignupAllowed },
      statusCode: HttpStatusCode.OK,
    });
  },
);

export const authController = {
  signup,
  verifyEmail,
  login,
  getMe,
  refresh,
  logout,
  checkSignupEligibility,
};
