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

userRouter.get(
  "/artist-managers",
  [verifyJWT, authorize("READ_USER")],
  userController.getArtistManagers,
);

userRouter.get(
  "/:id",
  [verifyJWT, authorize("READ_USER")],
  userController.getUserById,
);

userRouter.get(
  "/",
  [verifyJWT, authorize("READ_USER")],
  userController.getUsers,
);

userRouter.patch(
  "/profile/me",
  [
    verifyJWT,
    authorize("UPDATE_OWN_PROFILE"),
    validateRequest(UserValidation.updateProfileSchema),
  ],
  userController.updateProfile,
);

userRouter.patch(
  "/:id/profile",
  [
    verifyJWT,
    authorize("UPDATE_PROFILE"),
    validateRequest(UserValidation.updateProfileSchema),
  ],
  userController.updateProfile,
);

userRouter.delete(
  "/:id",
  [
    verifyJWT,
    authorize("DELETE_USER"),
    validateRequest(UserValidation.deleteUserSchema),
  ],
  userController.deleteUser,
);
