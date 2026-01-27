import prisma from "../config/prisma";
import { PrismaErrorCode } from "../enums";
import { Prisma } from "../generated/prisma/client";
import {
  AppError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
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

  async getAll(
    params: { limit: number; page: number },
    currentUserId?: number,
  ) {
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
        include: {
          user: {
            select: { id: true, username: true, avatar_url: true },
          },
          _count: {
            select: { likes: true },
          },
          likes: currentUserId
            ? {
                where: { user_id: currentUserId },
                select: { user_id: true },
              }
            : false,
        },
      });
      const totalPosts = await prisma.post.count();

      const formattedPosts = posts.map((post) => {
        const { _count, likes, ...postData } = post;
        return {
          postData,
          total_likes: _count.likes,
          is_liked: likes?.length > 0 || false,
        };
      });

      return { posts: formattedPosts, currentPage: page, totalPosts };
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

  async updateById(
    postId: number,
    userId: number,
    data: Post,
    newImage: Express.Multer.File | undefined,
  ) {
    // find post by user id
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      throw new NotFoundError("Post not found");
    }

    if (existingPost.user_id !== userId) {
      throw new UnauthorizedError("You are not authorized");
    }

    const oldUrlImage = existingPost?.image_url;

    const updatePayload = {
      caption: data.caption,
      image_url: oldUrlImage,
    };

    if (newImage) {
      if (oldUrlImage) {
        const oldFilePath = path.join(process.cwd(), "uploads", oldUrlImage);

        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      updatePayload.image_url = newImage.filename;
    }

    const updatePost = await prisma.post.update({
      where: { id: postId },
      data: updatePayload,
    });

    return updatePost;
  }

  async toggleLike(postId: number, userId: number) {
    try {
      // check post status, it has been like or not
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw new NotFoundError("Post not found");

      // check if user already like or not
      const isLiked = await prisma.like.findUnique({
        where: {
          user_id_post_id: {
            post_id: postId,
            user_id: userId,
          },
        },
      });

      if (isLiked) {
        // delete like
        await prisma.like.delete({
          where: {
            user_id_post_id: {
              post_id: postId,
              user_id: userId,
            },
          },
        });
      } else {
        // add new like
        await prisma.like.create({
          data: { post_id: postId, user_id: userId },
        });
      }

      const totalLikes = await prisma.like.count({
        where: { post_id: postId },
      });

      return { isLiked: isLiked ? true : false, totalLikes };
    } catch (error) {
      throw error;
    }
  }
}

export default PostService;
