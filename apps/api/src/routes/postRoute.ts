import express, { Router } from "express";
import { multerService } from "../services";
import { commentController, postController } from "../controllers";
import { parseImageUrl, validateRequest, verifyToken } from "../middlewares";
import {
  createCommentSchema,
  createPostSchema,
  getPostsSchema,
} from "../validations";

const router: Router = express.Router();

// create post
router.post(
  "/",
  verifyToken,
  multerService.singleUpload("photo"),
  parseImageUrl("image_url"),
  validateRequest(createPostSchema, "body"),
  postController.create,
);
// get posts
router.get(
  "/",
  validateRequest(getPostsSchema, "query"),
  postController.getAllPosts,
);
// get post by id
router.get("/:id", postController.getPostById);
// update post by id
router.patch(
  "/:id",
  verifyToken,
  multerService.singleUpload("photo"),
  parseImageUrl("image_url"),
  postController.updateById,
);
// like post
router.post("/:id/like", verifyToken, postController.toggleLike);

// comment post
router.post(
  "/:id/comments",
  verifyToken,
  validateRequest(createCommentSchema, "body"),
  commentController.createComment,
);
router.get("/:id/comments", commentController.getCommentByPostId);

// delete post
router.delete("/:id", verifyToken, postController.deletePostById);

export default router;
