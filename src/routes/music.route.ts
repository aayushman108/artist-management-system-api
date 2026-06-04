import express from "express";
import { musicController } from "src/controllers";
import { authorize, validateRequest, verifyJWT } from "src/middlewares";
import { MusicValidation } from "src/validationSchema";

export const musicRouter = express.Router();

musicRouter.use(verifyJWT);

musicRouter.get("/", [authorize("READ_MUSIC")], musicController.getMusics);

musicRouter.post("/", [authorize("CREATE_MUSIC"), validateRequest(MusicValidation.createMusicSchema)], musicController.createMusic);

musicRouter.put("/:id", [authorize("UPDATE_MUSIC"), validateRequest(MusicValidation.updateMusicSchema)], musicController.updateMusic);

musicRouter.delete("/:id", [authorize("DELETE_MUSIC"), validateRequest(MusicValidation.deleteMusicSchema)], musicController.deleteMusic);
