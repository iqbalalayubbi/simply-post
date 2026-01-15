import prisma from "../config/prisma";
import { InternalServerError } from "../libs/appError";
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
}

export default PostService;
