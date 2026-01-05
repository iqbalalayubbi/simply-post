import express, { Application } from "express";
import apiRouter from "./routes";

const app: Application = express();

app.use(express.json());

app.use("/api", apiRouter);

export default app;
