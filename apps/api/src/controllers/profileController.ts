import UserService from "../services/userService";
import { Request, Response } from "express";
import { ResponseType } from "../types";
import { HttpStatus } from "../enums";

class ProfileController {
  constructor(private userService: UserService) {}

  getProfile = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);
    const user = await this.userService.getUser({ id: userId });

    const response: ResponseType = {
      data: user,
      message: "Get user successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);
    const user = await this.userService.updateUser(userId, req.body);

    const response: ResponseType = {
      data: user,
      message: "User updated successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };
}

export default ProfileController;
