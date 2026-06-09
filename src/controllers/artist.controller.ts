import { Request, Response } from "express";
import { HttpStatusCode, UserRole, DeleteType } from "src/enums";
import { artistService } from "src/services/artist.service";
import { userService } from "src/services/user.service";
import {
  BadRequestError,
  asyncHandler,
  generatePaginationObj,
  sendSuccessResponse,
} from "src/utils";
import {
  IUpdateArtistInput,
  IUpdateArtistProfileInput,
} from "src/validationSchema";

const getAllArtists = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, managerId } = req.query;
  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const artistsData = await artistService.getAll(
    pageNumber,
    pageLimit,
    search as string,
    userId,
    userRole,
    managerId as string | undefined,
  );

  const { total, data } = artistsData;
  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "Artists fetched successfully",
    data: { data, pagination },
  });
});

const getArtistsByManagerId = asyncHandler(
  async (req: Request, res: Response) => {
    const { managerId } = req.params;
    const { page, limit, search } = req.query;
    const pageNumber = Number(page || 1);
    const pageLimit = Number(limit || 10);
    const userRole = req.userRole as UserRole;

    const artistsData = await artistService.getByManagerId(
      managerId,
      pageNumber,
      pageLimit,
      search as string,
      userRole,
    );

    const { total, data } = artistsData;

    const pagination = generatePaginationObj({
      total,
      page: pageNumber,
      limit: pageLimit,
    });

    return sendSuccessResponse(res, {
      message: "Artists fetched successfully",
      data: { data, pagination },
    });
  },
);

const getArtistByArtistId = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.userId as string;
    const userRole = req.userRole as UserRole;

    const artist = await artistService.getById(id, userId, userRole);

    return sendSuccessResponse(res, {
      message: "Artist fetched successfully",
      data: artist,
    });
  },
);

const updateArtist = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body as IUpdateArtistInput;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const artist = await artistService.update(id, data, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Artist updated successfully",
    data: artist,
  });
});

const updateArtistProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const targetUserId = req.params.id || req.userId;
    const data = req.body as IUpdateArtistProfileInput;
    const currentUserId = req.userId as string;
    const currentUserRole = req.userRole as UserRole;

    const result = await artistService.updateArtistProfile(
      targetUserId as string,
      data,
      currentUserId,
      currentUserRole,
    );

    return sendSuccessResponse(res, {
      message: "Artist profile updated successfully",
      data: result,
      statusCode: HttpStatusCode.OK,
    });
  },
);

const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as IUpdateArtistProfileInput;
  const userId = req.userId as string;

  const result = await artistService.updateMyProfile(userId, data);

  return sendSuccessResponse(res, {
    message: "Profile updated successfully",
    data: result,
  });
});

const deleteArtist = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  await artistService.delete(id, userId, userRole, type as DeleteType);

  return sendSuccessResponse(res, {
    message: "Artist deleted successfully",
    data: null,
  });
});

const importCsv = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  if (!req.file) {
    throw new BadRequestError("CSV file is required");
  }

  const csvContent = req.file.buffer.toString("utf-8");
  const { jobId } = await artistService.importCsv(csvContent, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Import started",
    data: { jobId },
    statusCode: HttpStatusCode.ACCEPTED,
  });
});

const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const csvData = await artistService.exportCsv(userId, userRole);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="artists-${new Date().toISOString().split("T")[0]}.csv"`,
  );
  return res.send(csvData);
});

export const artistController = {
  getAllArtists,
  getArtistsByManagerId,
  getArtistByArtistId,
  updateArtist,
  updateMyProfile,
  updateArtistProfile,
  deleteArtist,
  importCsv,
  exportCsv,
};
