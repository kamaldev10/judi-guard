// src/api/controllers/videoAnalysis.controller.js
const videoAnalysisService = require("../services/videoAnalysis.service");
const { BadRequestError, NotFoundError } = require("../../utils/errors"); // Pastikan NotFoundError diimpor jika belum

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

    console.log(
      `[Controller] Menerima permintaan analisis video: ${videoUrl} dari user: ${userId}`
    );

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

/**
 * Menangani permintaan penghapusan komentar yang sudah dianalisis.
 */
const deleteAnalyzedCommentController = async (req, res, next) => {
  try {
    const { analyzedCommentAppId } = req.params; // Ini adalah _id dari collection AnalyzedComment kita
    const userId = req.user._id; // Dari middleware isAuthenticated

    if (!analyzedCommentAppId) {
      throw new BadRequestError('Parameter "analyzedCommentAppId" diperlukan.');
    }

    const updatedComment =
      await videoAnalysisService.requestDeleteYoutubeComment(
        userId,
        analyzedCommentAppId
      );

    res.status(200).json({
      status: "success",
      message: `Komentar YouTube ID ${updatedComment.youtubeCommentId} berhasil diminta untuk dihapus dan status di database diperbarui.`,
      data: updatedComment,
    });
  } catch (error) {
    // Error dari service (misalnya NotFoundError, ForbiddenError, atau error dari YouTube API)
    // akan diteruskan ke global error handler
    next(error);
  }
};

module.exports = {
  submitVideoForAnalysis,
  getAnalyzedCommentsForVideo,
  deleteAnalyzedCommentController, // Tambahkan ini
};
