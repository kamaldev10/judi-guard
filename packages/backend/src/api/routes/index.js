// src/api/routes/index.js
const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const videoAnalysisRoutes = require("./videoAnalysis.routes");
const textPredictRoutes = require("./textPredict.routes");
const studioRoutes = require("./studio.routes");
const channelRoutes = require("./channel.routes");

const router = express.Router();

// Health check route
router.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "UP", message: "Judi Guard API is healthy 💪" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/analysis", videoAnalysisRoutes);
router.use("/studio", studioRoutes);
router.use("/text", textPredictRoutes);
router.use("/videos", channelRoutes);

module.exports = router;
