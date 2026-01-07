import express, { Router } from "express";
import { authController } from "../controllers";

const router: Router = express.Router();

router.post("/register", authController.register);

export default router;
