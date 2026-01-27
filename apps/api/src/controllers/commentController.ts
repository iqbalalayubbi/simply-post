import CommentService from "../services/commentService";
import { Request, Response } from "express";
import { ResponseType } from "../types";
import { HttpStatus } from "../enums";

class CommentController {
  constructor(private commentService: CommentService) {}

  createComment = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);
    const body = req.body;
    const comment = await this.commentService.create(
      userId,
      body.post_id,
      body.content,
    );

    const response: ResponseType = {
      data: comment,
      message: "Comment has been added",
      status: "success",
    };

    res.status(HttpStatus.CREATED).json(response);
  };

  getCommentByPostId = async (req: Request, res: Response) => {
    const postId = Number(req.params.id);
    const comments = await this.commentService.getAll(postId);

    const response: ResponseType = {
      data: comments,
      message: "Get comments successfully",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };

  deleteCommentById = async (req: Request, res: Response) => {
    const userId = Number(req.jwtPayload?.id);
    const commentId = Number(req.params.id);

    await this.commentService.deleteById(commentId, userId);

    const response: ResponseType = {
      data: null,
      message: "Comment has been deleted",
      status: "success",
    };

    res.status(HttpStatus.OK).json(response);
  };
}

export default CommentController;
