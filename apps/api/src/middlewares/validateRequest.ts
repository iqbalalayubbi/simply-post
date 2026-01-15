import { ZodError, ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../libs/appError";

type Source = "body" | "query" | "params";

const validateRequest = (schema: ZodObject, source: Source) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      Object.assign(req[source], parsed);
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

export default validateRequest;
