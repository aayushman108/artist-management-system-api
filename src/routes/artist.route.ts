import express from "express";
import { artistController } from "src/controllers";
import { authorize, validateRequest, verifyJWT } from "src/middlewares";
import { ArtistValidation } from "src/validationSchema";

export const artistRouter = express.Router();

artistRouter.use(verifyJWT);

artistRouter.get(
  "/",
  [authorize("READ_ARTIST")],
  artistController.getAllArtists,
);

artistRouter.get(
  "/manager/:managerId",
  [authorize("READ_ARTIST")],
  artistController.getArtistsByManagerId,
);

artistRouter.get(
  "/:id",
  [authorize("READ_ARTIST")],
  artistController.getArtistByArtistId,
);

artistRouter.put(
  "/:id",
  [
    authorize("UPDATE_ARTIST"),
    validateRequest(ArtistValidation.updateArtistSchema),
  ],
  artistController.updateArtist,
);

artistRouter.delete(
  "/:id",
  [
    authorize("DELETE_ARTIST"),
    validateRequest(ArtistValidation.deleteArtistSchema),
  ],
  artistController.deleteArtist,
);
