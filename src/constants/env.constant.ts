import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn("WARNING: DATABASE_URL is not set in production environment!");
}

export const ENV = {
  //Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Node
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "8000",

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",

  // JWT
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "15d",
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET || "",
  EMAIL_VERIFICATION_TOKEN_EXPIRY:
    process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY || "5m",

  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_USER: process.env.RESEND_USER || "",
};
