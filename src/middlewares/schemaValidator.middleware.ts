import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { HttpStatusCode } from "../enums/statusCode.enum";

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // const errorMessage = error.errors.map((e) => e.message).join(", ");
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.errors[0].message,
          // message: errorMessage,
        });
      } else {
        next(error);
      }
    }
  };
};
