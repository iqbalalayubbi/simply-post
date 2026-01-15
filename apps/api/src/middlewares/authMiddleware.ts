import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../enums";
import { JwtPayload, ResponseType } from "../types";
import { jwtService } from "../services";

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  let response: ResponseType;

  if (!token) {
    response = {
      data: null,
      message: "Unauthorized access, please login",
      status: "error",
    };
    return res.status(HttpStatus.UNAUTHORIZED).json(response);
  }

  try {
    const jwtPayload: JwtPayload = jwtService.verifyToken({
      token,
      tokenType: "access",
    });
    req.jwtPayload = jwtPayload;
    next();
  } catch (error) {
    next(error);
  }
};

export { verifyToken };
