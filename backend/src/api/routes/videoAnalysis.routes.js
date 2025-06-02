// src/api/routes/videoAnalysis.routes.js
const express = require("express");
const videoAnalysisController = require("../controllers/videoAnalysis.controller");
const isAuthenticated = require("../middlewares/isAuthenticated"); // Middleware autentikasi
const validateRequest = require("../middlewares/validateRequest"); // Jika Anda membuat skema validasi untuk body
const { submitVideoSchema } = require("../validators/video.validator");

const router = express.Router();

// Rute untuk mengirimkan video untuk dianalisis
// Dilindungi oleh isAuthenticated agar hanya user yang login bisa mengakses
router.post(
  "/videos",
  isAuthenticated,
  validateRequest(submitVideoSchema, "body"), // Validasi body request
  videoAnalysisController.submitVideoForAnalysis
);

// Rute untuk mendapatkan hasil komentar yang sudah dianalisis
router.get(
  "/videos/:analysisId/comments", // :analysisId adalah parameter URL
  isAuthenticated,
  videoAnalysisController.getAnalyzedCommentsForVideo
);

// :analyzedCommentAppId adalah _id dari komentar di database kita
router.delete(
  "/comments/:analyzedCommentAppId",
  isAuthenticated,
  videoAnalysisController.deleteAnalyzedCommentController
);

module.exports = router;
