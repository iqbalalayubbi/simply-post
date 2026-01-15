// src/utils/logger.ts
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

// Format log custom
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }), // Agar error stack trace terbaca
  winston.format.json() // Format JSON agar mudah diparsing mesin
);

// Transport untuk File (Log Rotation)
const fileTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-app.log`, // Nama file: 2026-01-15-app.log
  datePattern: "YYYY-MM-DD",
  zippedArchive: true, // Compress log lama jadi .gzip agar hemat storage
  maxSize: "20m", // Jika file > 20MB, buat file baru
  maxFiles: "14d", // Hapus log yang lebih tua dari 14 hari
  level: "info", // Catat level info ke atas (info, warn, error)
});

// Transport khusus Error
const errorTransport = new DailyRotateFile({
  filename: `${logDir}/%DATE%-error.log`,
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d", // Error log disimpan lebih lama (30 hari)
  level: "error", // HANYA mencatat error
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  transports: [fileTransport, errorTransport],
});

// Jika sedang di mode Development (Local), tampilkan juga di Terminal (Console)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple() // Format text biasa agar enak dibaca mata
      ),
    })
  );
}

export default logger;
