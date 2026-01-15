import { NextFunction, Request, Response } from "express";
import { AppError } from "../libs/appError";
import { HttpStatus } from "../enums";
import { logger } from "../utils";

const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      data: null,
    });
  }

  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  // not found route
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: "error",
    message: "Internal server error",
    data: null,
  });
};

export default errorHandler;
