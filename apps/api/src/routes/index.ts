import authRoutes from "./authRoutes";
import express, { Router } from "express";

const apiRouter: Router = express.Router();

apiRouter.use("/auth", authRoutes);

export default apiRouter;
