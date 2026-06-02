import { NextFunction, Request, Response } from "express";

type IAsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler = (func: IAsyncHandler) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
