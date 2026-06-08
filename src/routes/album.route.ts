import express from "express";
import { albumController } from "src/controllers";
import { authorize, validateRequest, verifyJWT } from "src/middlewares";
import { AlbumValidation } from "src/validationSchema";

export const albumRouter = express.Router();

albumRouter.use(verifyJWT);

albumRouter.get("/", [authorize("READ_MY_ALBUM")], albumController.getMyAlbums);

albumRouter.get(
  "/artist/:artistId",
  [authorize("READ_ALBUM_BY_ARTIST")],
  albumController.getAlbumByArtistId,
);

albumRouter.post(
  "/",
  [
    authorize("CREATE_ALBUM"),
    validateRequest(AlbumValidation.createAlbumSchema),
  ],
  albumController.createAlbum,
);

albumRouter.put(
  "/:id",
  [
    authorize("UPDATE_ALBUM"),
    validateRequest(AlbumValidation.updateAlbumSchema),
  ],
  albumController.updateAlbum,
);

albumRouter.delete(
  "/:id",
  [
    authorize("DELETE_ALBUM"),
    validateRequest(AlbumValidation.deleteAlbumSchema),
  ],
  albumController.deleteAlbum,
);
