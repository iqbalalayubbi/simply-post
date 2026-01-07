import { NotFoundError } from "../libs/appError";
import { Request, Response, NextFunction } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError("Route not found"));
};

export default notFound;
