/// <reference path="../types/express/index.d.ts" />
import { Request, Response } from "express";
import { postService } from "../services";
import { ResponseType } from "../types";
import { HttpStatus } from "../enums";

class PostController {
  async create(req: Request, res: Response) {
    const newPost = await postService.create(req.body);

    const response: ResponseType = {
      data: newPost,
      message: "Post has been created",
      status: "success",
    };

    res.status(HttpStatus.CREATED).json(response);
  }
}

export default PostController;
