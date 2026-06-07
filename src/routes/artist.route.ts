import express from "express";
import { artistController } from "src/controllers";
import { authorize, csvUpload, validateRequest, verifyJWT } from "src/middlewares";
import { ArtistValidation } from "src/validationSchema";

export const artistRouter = express.Router();

artistRouter.use(verifyJWT);

artistRouter.get(
  "/export",
  [authorize("EXPORT_ARTIST")],
  artistController.exportCsv,
);

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

artistRouter.post(
  "/import",
  [authorize("IMPORT_ARTIST"), csvUpload.single("file")],
  artistController.importCsv,
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
