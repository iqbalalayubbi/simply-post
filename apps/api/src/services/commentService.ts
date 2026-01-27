import { prisma } from "../config";
import { NotFoundError, UnauthorizedError } from "../libs/appError";

class CommentService {
  // create comment
  async create(userId: number, postId: number, content: string) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw new NotFoundError("Post not found");

      const comment = await prisma.comment.create({
        data: {
          user_id: userId,
          post_id: postId,
          content,
        },
        include: {
          user: { select: { id: true, username: true, avatar_url: true } },
        },
      });

      return comment;
    } catch (error) {
      throw error;
    }
  }

  async getAll(postId: number) {
    try {
      const comments = await prisma.comment.findMany({
        where: { post_id: postId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
            },
          },
        },
      });
      return comments;
    } catch (error) {
      throw error;
    }
  }

  async deleteById(commentId: number, userId: number) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: { post: true },
      });

      if (!comment) throw new NotFoundError("Comment not found");

      const isCommentOwner = comment.user_id === userId;
      const isPostOwner = comment.post.user_id === userId;

      if (!isCommentOwner && !isPostOwner) {
        throw new UnauthorizedError(
          "You are not authorized to delete this comment",
        );
      }

      await prisma.comment.delete({ where: { id: commentId } });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default CommentService;
