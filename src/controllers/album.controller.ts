import { Request, Response } from "express";
import { HttpStatusCode, UserRole } from "src/enums";
import { albumService } from "src/services";
import {
  asyncHandler,
  generatePaginationObj,
  sendSuccessResponse,
} from "src/utils";
import { ICreateAlbumInput, IUpdateAlbumInput } from "src/validationSchema";

const createAlbum = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as ICreateAlbumInput;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const album = await albumService.create(data, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Album created successfully",
    data: album,
    statusCode: HttpStatusCode.CREATED,
  });
});

const updateAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body as IUpdateAlbumInput;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const album = await albumService.update(id, data, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Album updated successfully",
    data: album,
    statusCode: HttpStatusCode.OK,
  });
});

const deleteAlbum = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  await albumService.delete(id, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Album deleted successfully",
    data: null,
    statusCode: HttpStatusCode.OK,
  });
});

const getMyAlbums = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, all } = req.query;
  const userId = req.userId as string;

  if (all === "true") {
    const albums = await albumService.getMyAlbums({ userId, all: true });
    return sendSuccessResponse(res, {
      message: "My albums fetched successfully",
      data: albums,
      statusCode: HttpStatusCode.OK,
    });
  }

  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);

  const { total, data } = await albumService.getMyAlbums({
    page: pageNumber,
    limit: pageLimit,
    search: search as string,
    userId,
  });

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "My albums fetched successfully",
    data: { data, pagination },
    statusCode: HttpStatusCode.OK,
  });
});

const getAlbumByArtistId = asyncHandler(
  async (req: Request, res: Response) => {
    const { artistId } = req.params;
    const { page, limit, search, all } = req.query;

    if (all === "true") {
      const albums = await albumService.getAlbumByArtistId({
        artistId,
        all: true,
      });
      return sendSuccessResponse(res, {
        message: "Albums fetched successfully",
        data: albums,
        statusCode: HttpStatusCode.OK,
      });
    }

    const pageNumber = Number(page || 1);
    const pageLimit = Number(limit || 10);

    const { total, data } = await albumService.getAlbumByArtistId({
      page: pageNumber,
      limit: pageLimit,
      search: search as string,
      artistId,
    });

    const pagination = generatePaginationObj({
      total,
      page: pageNumber,
      limit: pageLimit,
    });

    return sendSuccessResponse(res, {
      message: "Albums fetched successfully",
      data: { data, pagination },
      statusCode: HttpStatusCode.OK,
    });
  },
);

export const albumController = {
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getMyAlbums,
  getAlbumByArtistId,
};
