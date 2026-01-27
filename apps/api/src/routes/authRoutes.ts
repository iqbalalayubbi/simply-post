import express, { Router } from "express";
import { authController } from "../controllers";
import { validateRequest, verifyToken } from "../middlewares";
import {
  loginSchema,
  registerSchema,
  updatePasswordSchema,
} from "../validations";

const router: Router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  authController.register,
);
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  authController.login,
);
router.post(
  "/change-password",
  verifyToken,
  validateRequest(updatePasswordSchema, "body"),
  authController.changePassword,
);
router.get("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
export default router;
