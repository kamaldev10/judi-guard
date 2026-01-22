//* src/api/middlewares/errorHandler.js
const { AppError, BadRequestError } = require("../../utils/errors");

// Helper: Handle Error MongoDB Duplicate Key (E11000)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new BadRequestError(message);
};

// Helper: Handle Error MongoDB Validation
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new BadRequestError(message);
};

// Helper: Handle Error dari Axios (YouTube API)
const handleAxiosError = (err) => {
  // Axios error response biasanya ada di err.response
  const status = err.response?.status || 502;
  const message = err.response?.data?.error?.message || "External API Error";
  return new AppError(message, status);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // A. Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // B. Programming or other unknown error: don't leak details
  else {
    // 1. Log error (Gunakan library logger seperti Winston/Pino di masa depan)
    console.error("ERROR 💥:", err);

    // 2. Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong on our side.",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    // Deep copy error object karena beberapa property error JS tidak enumerable
    let error = Object.create(err);
    error.message = err.message;

    // --- ERROR ADAPTERS ---
    // Konversi error spesifik library menjadi AppError standar

    // 1. Handle Invalid ID MongoDB
    if (err.name === "CastError") error = handleCastErrorDB(err);

    // 2. Handle Validation Error Mongoose
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);

    // 3. Handle Axios Error (YouTube API)
    if (err.isAxiosError) error = handleAxiosError(err);

    // 4. Handle JWT Error (Jika nanti pakai Auth)
    if (err.name === "JsonWebTokenError")
      error = new AppError("Invalid token", 401);

    sendErrorProd(error, res);
  }
};
