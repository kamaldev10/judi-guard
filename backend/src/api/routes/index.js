// src/api/routes/index.js
const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const videoAnalysisRoutes = require("./videoAnalysis.routes"); // Impor ini

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "UP", message: "Judi Guard API is healthy 💪" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/analysis", videoAnalysisRoutes); // Daftarkan rute analisis, misal di bawah /api/v1/analysis

module.exports = router;
