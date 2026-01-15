import express, { Router } from "express";
import { multerService } from "../services";
import { postController } from "../controllers";
import { parseImageUrl, validateRequest, verifyToken } from "../middlewares";
import { createPostSchema, getPostsSchema } from "../validations";

const router: Router = express.Router();

router.post(
  "/",
  verifyToken,
  multerService.singleUpload("photo"),
  parseImageUrl,
  validateRequest(createPostSchema, "body"),
  postController.create
);
router.get(
  "/",
  validateRequest(getPostsSchema, "query"),
  postController.getAllPosts
);
router.get("/:id", postController.getPostById);
router.delete("/:id", verifyToken, postController.deletePostById);

export default router;
