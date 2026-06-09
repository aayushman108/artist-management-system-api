import express from "express";
import { authController } from "src/controllers";
import { validateRequest, verifyJWT } from "src/middlewares";
import { AuthValidation } from "src/validationSchema";

export const authRouter = express.Router();

authRouter.get("/signup-eligibility", authController.checkSignupEligibility);

authRouter.post(
  "/signup",
  validateRequest(AuthValidation.signupSchema),
  authController.signup,
);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  authController.login,
);
authRouter.get("/me", verifyJWT, authController.getMe);
authRouter.get("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);

authRouter.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordSchema),
  authController.resetPassword,
);
