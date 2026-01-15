import express, { Router } from "express";
import { authController } from "../controllers";
import { validateRequest } from "../middlewares";
import { loginSchema, registerSchema } from "../validations";

const router: Router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  authController.register
);
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  authController.login
);
router.get("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
