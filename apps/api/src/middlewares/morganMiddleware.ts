// src/middlewares/morganMiddleware.ts
import morgan, { StreamOptions } from "morgan";
import logger from "../utils/logger";

// Override stream morgan agar menggunakan winston http level
const stream: StreamOptions = {
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development"; // Di production, mungkin kita mau skip log http yang sukses agar hemat storage (opsional)
};

// Format string morgan
const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);

export default morganMiddleware;
