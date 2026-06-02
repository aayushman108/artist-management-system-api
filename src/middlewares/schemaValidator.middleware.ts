import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { HttpStatusCode } from "../enums/statusCode.enum";

export const validateRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse({
        body: req.body,
        params: req.params,
      });
      req.body = parsedData.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: error.issues[0].message,
          data: null,
        });
        return;
      } else {
        next(error);
      }
    }
  };
};
