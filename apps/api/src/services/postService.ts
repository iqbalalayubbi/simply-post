import prisma from "../config/prisma";
import { PrismaErrorCode } from "../enums";
import { Prisma } from "../generated/prisma/client";
import {
  AppError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../libs/appError";
import { Post } from "../models";
import fs from "fs";
import path from "path";

class PostService {
  async create(post: Post) {
    try {
      const newPost = await prisma.post.create({ data: post });
      return newPost;
    } catch (error) {
      throw new InternalServerError("Server is error");
    }
  }

  async getAll(params: { limit: number; page: number }) {
    //  limit -> total data to show | page -> current page that active
    const { limit, page } = params;
    const skipData = (page - 1) * limit;

    try {
      const posts = await prisma.post.findMany({
        skip: skipData,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      });
      const totalPosts = await prisma.post.count();

      return { posts, currentPage: page, totalPosts };
    } catch (error) {
      throw new InternalServerError("Server is error");
    }
  }

  async getById(id: number) {
    try {
      const post = await prisma.post.findFirstOrThrow({ where: { id } });
      return post;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == PrismaErrorCode.RECORD_NOT_FOUND) {
          throw new NotFoundError("Post not found");
        }
      }
      throw new InternalServerError("Server is error");
    }
  }

  async deleteById(postId: number, userId: number) {
    try {
      const post = await prisma.post.findFirstOrThrow({
        where: { id: postId },
      });

      if (post.user_id !== userId) {
        throw new ForbiddenError("You are not authorized to delete this post");
      }

      if (post.image_url) {
        const filePath = path.join(process.cwd(), "uploads", post.image_url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            throw new InternalServerError(`Failed to delete file: ${filePath}`);
          }
        }
      }

      await prisma.post.delete({ where: { id: postId, user_id: userId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == PrismaErrorCode.RECORD_NOT_FOUND) {
          throw new NotFoundError("Post not found");
        }
      }

      if (error instanceof AppError) {
        throw error;
      }
      throw new InternalServerError("Server is error");
    }
  }
}

export default PostService;
