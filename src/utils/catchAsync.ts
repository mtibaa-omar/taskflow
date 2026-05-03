import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

const catchAsync = (controller: AsyncController): RequestHandler => {
  return (req, res, next) => {
    controller(req, res, next).catch(next);
  };
};

export default catchAsync;
