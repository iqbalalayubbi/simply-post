import express, { Router } from "express";
import { profileController } from "../controllers";
import { parseImageUrl, validateRequest, verifyToken } from "../middlewares";
import { multerService } from "../services";
import { updateUserSchema } from "../validations";

const router: Router = express.Router();

router.get("/", verifyToken, profileController.getProfile);
router.patch(
  "/",
  verifyToken,
  multerService.singleUpload("avatar"),
  parseImageUrl("avatar_url"),
  validateRequest(updateUserSchema, "body"),
  profileController.updateProfile,
);

export default router;
