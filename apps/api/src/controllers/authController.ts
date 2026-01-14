import { NextFunction, Request, Response } from "express";
import { authService, jwtService } from "../services";
import { JwtPayload, ResponseType } from "../types";
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

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await authService.login(req.body);

      const response: ResponseType = {
        status: "success",
        message: "Login successfully",
        data: { user: userData?.user, token: userData?.accessToken },
      };

      res.cookie("refreshToken", userData?.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  refreshToken(req: Request, res: Response, next: NextFunction) {
    const userRefreshToken = req.cookies.refreshToken;

    if (!userRefreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: "error",
        message: "Please try to login again",
        data: null,
      });
    }

    try {
      const jwtPayload: JwtPayload = jwtService.verifyToken({
        token: userRefreshToken,
        tokenType: "refresh",
      });
      const { accessToken } = jwtService.generateTokens(jwtPayload);

      res.status(HttpStatus.OK).json({
        status: "success",
        message: "generate new token successfully",
        data: { token: accessToken },
      });
    } catch (error) {
      next(error);
    }
  }

  logout(req: Request, res: Response) {
    res.clearCookie("refreshToken");
    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Logout successfully",
      data: null,
    });
  }
}

export default AuthController;
