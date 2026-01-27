import authRoutes from "./authRoutes";
import postRoutes from "./postRoute";
import profileRoutes from "./profileRoutes";
import commentRoutes from "./commentRoutes";
import userRoutes from "./userRoutes";
import express, { Router } from "express";

const apiRouter: Router = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/post", postRoutes);
apiRouter.use("/profile/me", profileRoutes);
apiRouter.use("/comments", commentRoutes);
apiRouter.use("/users", userRoutes);
export default apiRouter;
