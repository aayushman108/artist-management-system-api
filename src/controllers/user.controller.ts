import { Request, Response } from "express";
import { HttpStatusCode, UserRole, UserStatus } from "src/enums";
import { sendSuccessResponse, generatePaginationObj } from "src/utils";
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

const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, role, status } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const pageOffset = Number((pageNumber - 1) * pageLimit);

  const usersData = await userService.getUsers(
    pageLimit,
    pageOffset,
    search as string,
    role as UserRole,
    status as UserStatus,
  );

  const { total, data } = usersData;

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    data: {
      data,
      pagination,
    },
    message: "Users fetched successfully",
  });
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body;
  const currentUserId = req.userId as string;
  const currentUserRole = req.userRole as UserRole;

  await userService.deleteUser(id, currentUserId, currentUserRole, type);

  return sendSuccessResponse(res, {
    message: "User deleted successfully.",
    data: null,
    statusCode: HttpStatusCode.OK,
  });
});

const getArtistManagers = asyncHandler(async (req: Request, res: Response) => {
  const data = await userService.getArtistManagers();

  return sendSuccessResponse(res, {
    message: "Artist managers fetched successfully",
    data,
    statusCode: HttpStatusCode.OK,
  });
});

export const userController = {
  inviteUser,
  verifyInvite,
  getUsers,
  deleteUser,
  getArtistManagers,
};
