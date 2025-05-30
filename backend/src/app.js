// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet"); // Untuk keamanan dasar HTTP Headers
const morgan = require("morgan"); // HTTP request logger
const mainRouter = require("./api/routes"); // Akan kita buat nanti
const errorHandler = require("./api/middlewares/errorHandler"); // Akan kita buat nanti
const { NotFoundError } = require("./utils/errors"); // Akan kita buat nanti

const app = express();

// Middlewares Global
app.use(
  cors({
    // Konfigurasi CORS yang lebih spesifik jika perlu
    origin: "https://judi-guard-app.vercel.app/" || "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet()); // Set security HTTP headers
app.use(express.json({ limit: "16kb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // Parse URL-encoded bodies

// HTTP request logger (morgan) - hanya di development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rute API Utama
app.use("/api/v1", mainRouter); // Semua rute akan di-prefix dengan /api/v1

// Test route
app.get("/", (req, res) => {
  res.send("Judi Guard Backend V1 is alive! 🚀");
});

// Middleware untuk menangani rute tidak ditemukan (404)
app.use((req, res, next) => {
  next(new NotFoundError(`Resource not found at ${req.originalUrl}`));
});

// Global Error Handler (harus menjadi middleware terakhir)
app.use(errorHandler);

module.exports = app;
