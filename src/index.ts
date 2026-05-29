import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler, verifyJWT } from "./middlewares";
import cookieParser from "cookie-parser";
import "./config/cloudinary.config";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(cors());

app.use(verifyJWT);

app.use(errorHandler);

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
