import UserService from "../services/userService";
import { Request, Response } from "express";
import { ResponseType } from "../types";
import { HttpStatus } from "../enums";

class UserController {
  constructor(private userService: UserService) {}

  toggleFollow = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);
    const otherUserId = Number(req.params.id);
    const followStatus = await this.userService.toggleFollow(
      userId,
      otherUserId,
    );

    const response: ResponseType = {
      data: followStatus,
      message: "Change follow status successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };

  getFollowers = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);

    const followers = await this.userService.getFollowers(userId);

    const response: ResponseType = {
      data: followers,
      message: "Get followers successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };

  getFollowing = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);

    const followers = await this.userService.getFollowing(userId);

    const response: ResponseType = {
      data: followers,
      message: "Get followers successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };

  getInteractions = async (req: Request, res: Response) => {
    const username = req.params.username;
    const interactions = await this.userService.getInteractions(username);

    const response: ResponseType = {
      data: interactions,
      message: "Get followers successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };
}

export default UserController;
