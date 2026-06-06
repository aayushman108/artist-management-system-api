import { Request, Response } from "express";
import { HttpStatusCode, InvitationRequestStatus, UserRole } from "src/enums";
import {
  asyncHandler,
  sendSuccessResponse,
  generatePaginationObj,
} from "src/utils";
import { ICreateInvitationRequestInput } from "src/validationSchema";
import { invitationRequestService } from "src/services/invitationRequest.service";

const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const data = await invitationRequestService.create(
    req.body as ICreateInvitationRequestInput,
  );

  return sendSuccessResponse(res, {
    message: "Invitation request submitted successfully.",
    data,
    statusCode: HttpStatusCode.CREATED,
  });
});

const getRequests = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, role, search } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);

  const result = await invitationRequestService.getAll(
    pageNumber,
    pageLimit,
    status as InvitationRequestStatus,
    role as UserRole,
    search as string,
  );

  const pagination = generatePaginationObj({
    total: result.total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "Invitation requests fetched successfully.",
    data: { data: result.data, pagination },
  });
});

const getInvitations = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, role, search } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const userRole = req.userRole as string;
  const userId = req.userId as string;

  const invitedBy = userRole === UserRole.SUPER_ADMIN ? undefined : userId;

  const result = await invitationRequestService.getInvitations(
    pageNumber,
    pageLimit,
    status as InvitationRequestStatus,
    role as UserRole,
    search as string,
    invitedBy,
  );

  const pagination = generatePaginationObj({
    total: result.total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "Invitations fetched successfully.",
    data: { data: result.data, pagination },
  });
});

const sendInvitation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = req.userId as string;

  const result = await invitationRequestService.invite(id, adminId);

  return sendSuccessResponse(res, {
    message: "Invitation sent successfully.",
    data: result,
    statusCode: HttpStatusCode.OK,
  });
});

const updateRequestStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const result = await invitationRequestService.updateStatus(
      id,
      status as InvitationRequestStatus,
    );

    return sendSuccessResponse(res, {
      message: `Invitation request status updated to "${status}".`,
      data: result,
      statusCode: HttpStatusCode.OK,
    });
  },
);

const deleteRequest = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await invitationRequestService.remove(id);

  return sendSuccessResponse(res, {
    message: "Invitation request deleted.",
    data: result,
    statusCode: HttpStatusCode.OK,
  });
});

export const invitationRequestController = {
  createRequest,
  getRequests,
  getInvitations,
  sendInvitation,
  updateRequestStatus,
  deleteRequest,
};
