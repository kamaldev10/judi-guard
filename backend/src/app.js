// src/app.js
const express = require("express");
const cors = require("cors"); // Pastikan sudah diimpor
const helmet = require("helmet");
const morgan = require("morgan");
const mainRouter = require("./api/routes");
const errorHandler = require("./api/middlewares/errorHandler");
const { NotFoundError } = require("./utils/errors");

const app = express();

// --- AWAL PERUBAHAN KONFIGURASI CORS ---
// Daftar origin yang diizinkan
const allowedOrigins = [
  "http://localhost:5173", // Untuk development frontend React/Vite Anda
  "https://judi-guard-app.vercel.app", // Untuk produksi frontend Anda (pertahankan jika sudah ada)
  // Tambahkan origin lain jika perlu
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (misalnya, dari Postman, mobile apps, curl)
    // atau jika origin ada di dalam daftar allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Akses tidak diizinkan oleh kebijakan CORS"));
    }
  },
  credentials: true, // Penting jika Anda mengirim cookies atau header Authorization
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Metode HTTP yang diizinkan
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Header yang diizinkan
};

app.use(cors(corsOptions)); // Gunakan opsi CORS yang sudah dikonfigurasi
// --- AKHIR PERUBAHAN KONFIGURASI CORS ---

app.use(helmet());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1", mainRouter);

app.get("/", (req, res) => {
  res.send("Judi Guard Backend V1 is alive! 🚀");
});

app.use((req, res, next) => {
  next(new NotFoundError(`Resource not found at ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
