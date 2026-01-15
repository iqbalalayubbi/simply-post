/// <reference path="../types/express/index.d.ts" />
import { Request, Response } from "express";
import { ResponseType } from "../types";
import { HttpStatus } from "../enums";
import PostService from "../services/postService";

class PostController {
  constructor(private postService: PostService) {}

  create = async (req: Request, res: Response) => {
    const newPost = await this.postService.create(req.body);

    const response: ResponseType = {
      data: newPost,
      message: "Post has been created",
      status: "success",
    };

    res.status(HttpStatus.CREATED).json(response);
  };

  getPostById = async (req: Request, res: Response) => {
    const post = await this.postService.getById(Number(req.params.id));
    const response: ResponseType = {
      data: post,
      message: "Received post successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };

  getAllPosts = async (req: Request, res: Response) => {
    const params = {
      limit: Number(req.query?.limit ?? 5),
      page: Number(req.query?.page ?? 1),
    };
    console.log({ params });

    const posts = await this.postService.getAll(params);

    const response: ResponseType = {
      data: posts,
      message: "Received posts successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };
}

export default PostController;
