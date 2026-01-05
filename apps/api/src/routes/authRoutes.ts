import express, { Router } from "express";
import { authController } from "../controllers";

const router: Router = express.Router();

router.get("/register", authController.register);

export default router;
