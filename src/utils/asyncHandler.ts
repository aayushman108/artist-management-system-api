import { NextFunction, Request, Response } from "express";

type IAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (func: IAsyncHandler): IAsyncHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
