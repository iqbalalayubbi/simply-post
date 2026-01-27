import express, { Router } from "express";
import { verifyToken } from "../middlewares";
import { commentController } from "../controllers";

const router: Router = express.Router();

router.delete("/:id", verifyToken, commentController.deleteCommentById);

export default router;
