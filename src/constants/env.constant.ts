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
};
