import express from "express";
import { authController } from "src/controllers";
import { validateRequest } from "src/middlewares";
import { UserValidation } from "src/validationSchema";

export const authRoute = express.Router();

authRoute.post(
  "/signup",
  validateRequest(UserValidation.signupSchema),
  authController.signup,
);
authRoute.post("/verify-email", authController.verifyEmail);
