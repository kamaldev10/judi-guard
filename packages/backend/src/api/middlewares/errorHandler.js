// src/api/middlewares/errorHandler.js
const config = require("../../config/environment");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error di development atau jika error bukan operasional
  if (process.env.NODE_ENV === "development" || !err.isOperational) {
    console.error("ERROR 💥:", err);
  }

  // Kirim respons error ke client
  // Hanya kirim detail error operasional ke client di produksi
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Hanya tampilkan stack di development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Cara lain
  });
};

module.exports = errorHandler;
