import { NextFunction, Request, Response } from "express";
import { authService } from "../services";
import { ResponseType } from "../types";
import { HttpStatus } from "../enums";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const newUser = await authService.register(req.body);
      const response: ResponseType = {
        status: "success",
        message: "Register successfully",
        data: newUser,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
