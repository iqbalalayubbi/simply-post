import prisma from "../config/prisma";
import { PrismaErrorCode } from "../enums";
import { Prisma } from "../generated/prisma/client";
import { InternalServerError, NotFoundError } from "../libs/appError";
import { Post } from "../models";

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
}

export default PostService;
