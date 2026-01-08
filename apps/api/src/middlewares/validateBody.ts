import { ZodError, ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../libs/appError";

const validateBody = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((err) => err.message).join(", ");
        throw new ValidationError(messages);
      }
      next(error);
    }
  };
};

export default validateBody;
