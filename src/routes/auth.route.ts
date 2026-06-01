import express from "express";
import { authController } from "src/controllers";
import { validateRequest, verifyJWT } from "src/middlewares";
import { UserValidation } from "src/validationSchema";

export const authRouter = express.Router();

authRouter.post(
  "/signup",
  validateRequest(UserValidation.signupSchema),
  authController.signup,
);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post(
  "/login",
  validateRequest(UserValidation.loginSchema),
  authController.login,
);
authRouter.get("/refresh", authController.refresh);
authRouter.get("/logout", verifyJWT, authController.logout);
