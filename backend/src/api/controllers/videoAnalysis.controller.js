// src/api/controllers/videoAnalysis.controller.js
const videoAnalysisService = require("../services/videoAnalysis.service");
const { BadRequestError, NotFoundError } = require("../../utils/errors"); // Pastikan NotFoundError diimpor jika belum
const VideoAnalysis = require("../../models/VideoAnalysis.model");

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

    // PENTING: Seperti yang didiskusikan, service startVideoAnalysis saat ini
    // akan berjalan hingga semua komentar dianalisis sebelum mengembalikan respons.
    // Ini bisa lama dan menyebabkan timeout HTTP untuk video dengan banyak komentar.
    // Untuk produksi, ini idealnya diubah menjadi proses background.
    const analysisResult = await videoAnalysisService.startVideoAnalysis(
      userId,
      videoUrl
    );

    // Jika sampai sini tanpa error, analisis (setidaknya tahap awal/keseluruhan) selesai.
    res.status(200).json({
      // Bisa juga 201 Created jika menganggap 'analysis' adalah resource baru
      status: "success",
      message: "Analisis video telah dimulai dan selesai diproses.", // Sesuaikan pesan jika prosesnya background
      data: analysisResult, // Mengembalikan detail VideoAnalysis
    });
  } catch (error) {
    console.error("[Controller] Error saat submitVideoForAnalysis:", error);
    next(error); // Teruskan error ke global error handler
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
    const { analysisId, analyzedCommentId, youtubeCommentId } = req.params;
    const userId = req.user._id;

    if (!analyzedCommentId) {
      throw new BadRequestError('Parameter "analyzedCommentId" diperlukan.');
    }

    if (!youtubeCommentId) {
      throw new BadRequestError('Parameter "analyzedCommentId" diperlukan.');
    }

    const updatedComment =
      await videoAnalysisService.requestDeleteYoutubeComment(
        userId,
        analyzedCommentId,
        youtubeCommentId
      );

    res.status(200).json({
      status: "success",
      message: `Permintaan penghapusan komentar YouTube dari AnalyzedComment ${analyzedCommentId} berhasil diproses.`,
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitVideoForAnalysis,
  getAnalyzedCommentsForVideo,
  batchDeleteJudiCommentsController,
  deleteAnalyzedCommentController,
};
