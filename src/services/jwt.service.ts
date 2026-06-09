import jwt, { Secret } from "jsonwebtoken";
import { ENV } from "../constants";

class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;
  private forgotPasswordSecret: Secret;

  constructor() {
    this.accessSecret = ENV.ACCESS_TOKEN_SECRET as Secret;
    this.refreshSecret = ENV.REFRESH_TOKEN_SECRET as Secret;
    this.forgotPasswordSecret = ENV.FORGOT_PASSWORD_SECRET as Secret;
  }

  generateAccessToken(payload: object): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: (ENV.ACCESS_TOKEN_EXPIRY ||
        "15m") as jwt.SignOptions["expiresIn"],
    });
  }

  generateRefreshToken(payload: object): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: (ENV.REFRESH_TOKEN_EXPIRY ||
        "15d") as jwt.SignOptions["expiresIn"],
    });
  }

  verifyAccessToken(token: string): object | string {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string): object | string {
    return jwt.verify(token, this.refreshSecret);
  }

  generateForgotPasswordToken(user: Auth.IUser): string {
    return jwt.sign(
      { id: user.id },
      this.forgotPasswordSecret + user.password_hash,
      {
        expiresIn: (ENV.FORGOT_PASSWORD_TOKEN_EXPIRY ||
          "10m") as jwt.SignOptions["expiresIn"],
      },
    );
  }

  verifyForgotPasswordToken(token: string, user: Auth.IUser): object | string {
    return jwt.verify(token, this.forgotPasswordSecret + user.password_hash);
  }
}

export const jwtService = new JwtService();
