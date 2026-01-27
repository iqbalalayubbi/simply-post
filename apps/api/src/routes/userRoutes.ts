import express, { Router } from "express";
import { verifyToken } from "../middlewares";
import { userController } from "../controllers";

const router: Router = express.Router();

router.post("/:id/follow", verifyToken, userController.toggleFollow);
router.get("/followers", verifyToken, userController.getFollowers);
router.get("/following", verifyToken, userController.getFollowing);
router.get("/:username/interactions", userController.getInteractions);

export default router;
