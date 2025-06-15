// src/api/routes/videoAnalysis.routes.js
const express = require("express");
const videoAnalysisController = require("../controllers/videoAnalysis.controller");
const isAuthenticated = require("../middlewares/isAuthenticated"); // Middleware autentikasi
const validateRequest = require("../middlewares/validateRequest"); // Jika Anda membuat skema validasi untuk body
const {
  submitVideoSchema,
  analysisIdParamSchema,
  commentAppIdParamSchema,
} = require("../validators/video.validator");

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
  // Opsional: Validasi parameter analysisId jika Anda punya skema validatornya
  // validateRequest(analysisIdParamSchema, "params"),
  videoAnalysisController.getAnalyzedCommentsForVideo
);

// Rute untuk menghapus SATU komentar spesifik dari YouTube (berdasarkan ID aplikasi kita)
// :analyzedCommentId adalah _id dari komentar di database kita
router.delete(
  "/comments/:analyzedCommentId",
  isAuthenticated,
  async (req, res, next) => {
    try {
      await videoAnalysisController.deleteAnalyzedCommentController(
        req,
        res,
        next
      );
    } catch (error) {
      next(error);
    }
  }
);

// Menargetkan videoAnalysisId untuk menghapus semua komentar "judi" terkait.
router.delete(
  "/videos/:analysisId/judi-comments", // :analysisId adalah parameter URL
  isAuthenticated,
  // Opsional: Validasi parameter analysisId
  // validateRequest(analysisIdParamSchema, "params"),
  videoAnalysisController.batchDeleteJudiCommentsController // Controller baru untuk batch delete
);

module.exports = router;
