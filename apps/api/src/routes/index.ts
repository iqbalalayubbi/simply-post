import authRoutes from "./authRoutes";
import postRoutes from "./postRoute";
import express, { Router } from "express";

const apiRouter: Router = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/post", postRoutes);

export default apiRouter;
