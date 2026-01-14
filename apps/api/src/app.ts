import "./config/dotenvConfig";
import express, { Application } from "express";
import apiRouter from "./routes";
import { errorHandler, notFound } from "./middlewares";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));

app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
