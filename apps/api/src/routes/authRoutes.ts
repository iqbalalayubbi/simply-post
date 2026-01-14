import express, { Router } from "express";
import { authController } from "../controllers";
import { validateBody } from "../middlewares";
import { loginSchema, registerSchema } from "../validations";

const router: Router = express.Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.get("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
