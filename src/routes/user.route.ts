import express from "express";
import { userController } from "src/controllers";
import { authorize, validateRequest, verifyJWT } from "src/middlewares";
import { UserValidation } from "src/validationSchema";

export const userRouter = express.Router();

userRouter.post(
  "/invite",
  [
    verifyJWT,
    authorize("CREATE_USER"),
    validateRequest(UserValidation.inviteUserSchema),
  ],
  userController.inviteUser,
);
userRouter.post(
  "/verify-invite",
  validateRequest(UserValidation.verifyInviteSchema),
  userController.verifyInvite,
);
