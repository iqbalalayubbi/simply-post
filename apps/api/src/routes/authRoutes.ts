import express, { Router } from "express";
import { authController } from "../controllers";
import { validateBody } from "../middlewares";
import { registerSchema } from "../validations";

const router: Router = express.Router();

router.post("/register", validateBody(registerSchema), authController.register);

export default router;
