import { Request, Response } from "express";
import { HttpStatusCode, UserRole } from "src/enums";
import { musicService } from "src/services";
import {
  asyncHandler,
  generatePaginationObj,
  sendSuccessResponse,
} from "src/utils";
import { ICreateMusicInput, IUpdateMusicInput } from "src/validationSchema";

const createMusic = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as ICreateMusicInput;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const music = await musicService.create(data, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Music created successfully",
    data: music,
    statusCode: HttpStatusCode.CREATED,
  });
});

const updateMusic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body as IUpdateMusicInput;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  const music = await musicService.update(id, data, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Music updated successfully",
    data: music,
    statusCode: HttpStatusCode.OK,
  });
});

const deleteMusic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId as string;
  const userRole = req.userRole as UserRole;

  await musicService.delete(id, userId, userRole);

  return sendSuccessResponse(res, {
    message: "Music deleted successfully",
    data: null,
    statusCode: HttpStatusCode.OK,
  });
});

const getMusics = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, artistId, albumId } = req.query;

  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);

  const { total, data } = await musicService.getAll({
    page: pageNumber,
    limit: pageLimit,
    search: search as string,
    artistId: artistId as string,
    albumId: albumId as string,
  });

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "Musics fetched successfully",
    data: { data, pagination },
    statusCode: HttpStatusCode.OK,
  });
});

const getMusicsByArtistId = asyncHandler(async (req: Request, res: Response) => {
  const { artistId } = req.params;
  const { page, limit, search, albumId } = req.query;

  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);

  const { total, data } = await musicService.getMusicsByArtistId({
    page: pageNumber,
    limit: pageLimit,
    search: search as string,
    artistId: artistId as string,
    albumId: albumId as string,
  });

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "Musics fetched successfully",
    data: { data, pagination },
    statusCode: HttpStatusCode.OK,
  });
});

const getMyMusics = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, albumId } = req.query;
  const userId = req.userId as string;

  const pageNumber = Number(page || 1);
  const pageLimit = Number(limit || 10);

  const { total, data } = await musicService.getMyMusics({
    page: pageNumber,
    limit: pageLimit,
    search: search as string,
    userId,
    albumId: albumId as string,
  });

  const pagination = generatePaginationObj({
    total,
    page: pageNumber,
    limit: pageLimit,
  });

  return sendSuccessResponse(res, {
    message: "My musics fetched successfully",
    data: { data, pagination },
    statusCode: HttpStatusCode.OK,
  });
});

export const musicController = {
  createMusic,
  updateMusic,
  deleteMusic,
  getMusics,
  getMusicsByArtistId,
  getMyMusics,
};
