import express, { Router } from "express";
import { multerService } from "../services";
import { postController } from "../controllers";
import { validateBody, verifyToken } from "../middlewares";
import { createPostSchema } from "../validations";

const router: Router = express.Router();

router.post(
  "/",
  verifyToken,
  multerService.singleUpload("photo"),
  multerService.mergeFileNameToRequest,
  validateBody(createPostSchema),
  postController.create
);

export default router;
