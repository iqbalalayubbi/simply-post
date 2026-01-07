import { Request, Response } from "express";
import { AppError } from "../libs/appError";
import { HttpStatus } from "../enums";

const errorHandler = (err: AppError, req: Request, res: Response) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      data: null,
    });
  }

  console.log(err);

  // // not found route
  // return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //   status: "error",
  //   message: "Internal server error",
  //   data: null,
  // });
};

export default errorHandler;
