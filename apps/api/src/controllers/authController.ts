import { NextFunction, Request, Response } from "express";
import { JwtPayload, ResponseType } from "../types";
import { HttpStatus } from "../enums";
import AuthService from "../services/authService";
import JwtService from "../services/jwtService";

class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await this.authService.register(req.body);
      const response: ResponseType = {
        status: "success",
        message: "Register successfully",
        data: newUser,
      };
      res.status(HttpStatus.CREATED).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = await this.authService.login(req.body);

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
  };

  changePassword = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);

    await this.authService.changePassword(userId, req.body);

    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Password updated successfully",
      data: true,
    });
  };

  refreshToken = (req: Request, res: Response, next: NextFunction) => {
    const userRefreshToken = req.cookies.refreshToken;

    if (!userRefreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: "error",
        message: "Please try to login again",
        data: null,
      });
    }

    try {
      const jwtPayload: JwtPayload = this.jwtService.verifyToken({
        token: userRefreshToken,
        tokenType: "refresh",
      });
      const { accessToken } = this.jwtService.generateTokens(jwtPayload);

      res.status(HttpStatus.OK).json({
        status: "success",
        message: "generate new token successfully",
        data: { token: accessToken },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = (req: Request, res: Response) => {
    res.clearCookie("refreshToken");
    res.status(HttpStatus.OK).json({
      status: "success",
      message: "Logout successfully",
      data: null,
    });
  };
}

export default AuthController;
