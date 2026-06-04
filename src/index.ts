import express from "express";
import cors from "cors";
import { errorHandler, verifyJWT } from "./middlewares";
import cookieParser from "cookie-parser";
import "./config/cloudinary.config";
import { ENV } from "./constants";
import { db } from "./database/db";
import { albumRouter, authRouter, userRouter } from "./routes";
import { initEmailListeners } from "./listeners/email.listener";

initEmailListeners();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.use("/api/albums", albumRouter);

app.use(errorHandler);

const PORT = ENV.PORT;

const startServer = async () => {
  try {
    // Verify database connection
    await db.raw("SELECT 1");
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    if (error instanceof Error) {
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
    }
    process.exit(1);
  }
};

startServer();
