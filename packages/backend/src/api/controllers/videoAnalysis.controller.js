// src/api/controllers/videoAnalysis.controller.js
const videoAnalysisService = require("../services/videoAnalysis.service");
const youtubeService = require("../services/youtube.service");
const { BadRequestError, NotFoundError } = require("../../utils/errors");
const AnalyzedComment = require("../models/AnalyzedComment.model");

/**
 * Menerima URL video dari pengguna dan memulai proses analisis.
 */
const submitVideoForAnalysis = async (req, res, next) => {
  try {
    const { videoUrl } = req.body;
    const userId = req.user._id; // Didapatkan dari middleware isAuthenticated

    if (!videoUrl) {
      throw new BadRequestError('Parameter "videoUrl" diperlukan.');
    }

    // console.log(
    //   `[Controller] Menerima permintaan analisis video: ${videoUrl} dari user: ${userId}`
    // );

    const analysisResult = await videoAnalysisService.startVideoAnalysis(
      userId,
      videoUrl
    );

    res.status(200).json({
      status: "success",
      message: "Analisis video telah dimulai dan selesai diproses.", // Sesuaikan pesan jika prosesnya background
      data: analysisResult, // Mengembalikan detail VideoAnalysis
    });
  } catch (error) {
    console.error("[Controller] Error saat submitVideoForAnalysis:", error);
    next(error);
  }
};

/**
 * Mengambil hasil komentar yang sudah dianalisis untuk sebuah VideoAnalysis.
 */
const getAnalyzedCommentsForVideo = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user._id; // Dari middleware isAuthenticated

    console.log(
      `[video Analysis Controller] Mencari komentar untuk analysisId: ${analysisId}`
    );

    if (!analysisId) {
      throw new BadRequestError('Parameter "analysisId" diperlukan.');
    }

    const comments = await videoAnalysisService.getAnalysisResults(
      analysisId,
      userId
    );

    res.status(200).json({
      status: "success",
      message: "Data komentar hasil analisis berhasil diambil.",
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

const batchDeleteJudiCommentsController = async (req, res, next) => {
  try {
    const userId = req.user._id; // Diambil dari middleware isAuthenticated
    const { analysisId } = req.params; // Ambil analysisId dari parameter URL

    if (!analysisId) {
      throw new BadRequestError("Parameter analysisId diperlukan.");
    }

    const result = await videoAnalysisService.requestBatchDeleteJudiComments(
      userId,
      analysisId
    );

    res.status(204).json({
      success: true,
      message:
        result.message ||
        "Proses penghapusan massal komentar 'judi' telah diproses.",
      data: {
        totalTargeted: result.totalTargeted,
        successfullyDeleted: result.successfullyDeleted,
        failedToDelete: result.failedToDelete,
        failures: result.failures,
      },
    });
  } catch (error) {
    next(error); // Teruskan error ke global error handler
  }
};

const deleteAnalyzedCommentController = async (req, res, next) => {
  try {
    const { analyzedCommentId } = req.params;
    const userId = req.user._id;

    // Dapatkan youtubeCommentId dari database terlebih dahulu
    const commentInDb = await AnalyzedComment.findOne({
      _id: analyzedCommentId,
      userId,
    });
    if (!commentInDb) {
      return res.status(404).json({
        status: "error",
        message: "Komentar tidak ditemukan di database Anda.",
      });
    }

    // Panggil service layer untuk menghapus atau memoderasi
    const result = await videoAnalysisService.requestDeleteYoutubeComment(
      userId,
      analyzedCommentId,
      commentInDb.youtubeCommentId // Gunakan youtubeCommentId yang didapat dari DB
    );

    let successMessage = "Komentar berhasil diproses.";
    if (result.isDeletedOnYoutube) {
      successMessage = "Komentar berhasil dihapus permanen.";
    } else if (result.isModeratedOnYoutube) {
      successMessage =
        "Komentar berhasil disembunyikan (dimoderasi) sebagai spam di video Anda.";
    }

    res.status(200).json({
      status: "success",
      message: successMessage,
      data: {
        youtubeCommentId: result.youtubeCommentId,
        isDeletedOnYoutube: result.isDeletedOnYoutube,
        isModeratedOnYoutube: result.isModeratedOnYoutube,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Delete/Moderate Comment Error di Controller:", {
      params: req.params,
      error: error.message,
      stack: error.stack,
    });

    // Sesuaikan status code berdasarkan jenis error
    const statusCode = error.code || error.status || 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message || "Gagal menghapus atau memoderasi komentar.",
      details: error.details,
    });
    next(error);
  }
};

module.exports = {
  submitVideoForAnalysis,
  getAnalyzedCommentsForVideo,
  batchDeleteJudiCommentsController,
  deleteAnalyzedCommentController,
};
