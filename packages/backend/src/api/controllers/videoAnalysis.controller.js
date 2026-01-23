// src/api/controllers/videoAnalysis.controller.js
const videoAnalysisService = require("../services/videoAnalysis.service");
const youtubeService = require("../services/youtube.service");
const { BadRequestError, NotFoundError } = require("../../utils/errors");
const AnalyzedComment = require("../models/AnalyzedComment.model");
const VideoAnalysis = require("../models/VideoAnalysis.model");

//* --- NEW LOGIC ---

/**
 * @desc    Memulai proses analisis video (Fetch -> Store -> AI)
 * @route   POST /api/analysis/:videoId
 * @access  Private (User/Guest)
 */
const startAnalysis = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const tokens = req.youtubeTokens; // Dari middleware ensureYoutubeAccess

    // Identifikasi User vs Guest
    const userId = req.user ? req.user._id : null;
    const isGuest = !!req.isGuest; // Boolean

    // 1. Ambil Detail Video (Judul, dll) untuk disimpan di history
    // Cost: 1 Unit
    const videoDetail = await youtubeService.getVideoById(tokens, videoId);

    // 2. Buat Tiket Analisis di DB (Status: PROCESSING)
    const analysisRecord = await videoAnalysisService.createAnalysisRecord({
      userId,
      videoId, // youtubeVideoId
      title: videoDetail.title,
      isGuest,
    });

    // 3. JALANKAN BACKGROUND PROCESS (Fire & Forget)
    // Proses ini berjalan di background server.
    videoAnalysisService
      .processAnalysis({
        analysisId: analysisRecord._id,
        videoId,
        tokens,
        userId,
      })
      .catch((err) => {
        // Error handling khusus background process (Log only)
        console.error("Background Analysis Failed:", err);
        // Service sudah menghandle update status ke FAILED, jadi aman.
      });

    // 4. Response Cepat ke Frontend
    res.status(202).json({
      status: "success",
      message: "Permintaan analisis diterima dan sedang diproses.",
      data: {
        analysisId: analysisRecord._id,
        videoId: videoId,
        status: "PROCESSING",
        ticketCreated: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cek Status Analisis (Polling Endpoint)
 * @route   GET /api/analysis/status/:analysisId
 * @access  Private (User/Guest)
 */
const getAnalysisStatus = async (req, res, next) => {
  try {
    const { analysisId } = req.params;

    // Cari record berdasarkan ID
    const analysis = await VideoAnalysis.findById(analysisId).select(
      "status totalCommentsFetched totalCommentsAnalyzed totalSpamDetected errorMessage completedAt moderationStatus",
    );

    if (!analysis) {
      throw new AppError("Data analisis tidak ditemukan.", 404);
    }

    res.status(200).json({
      status: "success",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ambil detail hasil analisis (List Komentar)
 * @route   GET /api/analysis/:analysisId/results?page=1&type=spam
 */
const getAnalysisResults = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const { page, limit, type } = req.query; // type: 'all' | 'spam' | 'safe'

    // Validasi kepemilikan (Opsional tapi recommended)
    // Cek apakah analysisId ini milik user yang sedang login
    const analysisHeader = await VideoAnalysis.findById(analysisId);
    if (!analysisHeader) {
      throw new AppError("Data analisis tidak ditemukan.", 404);
    }

    const data = await videoAnalysisService.getAnalysisResults(analysisId, {
      page,
      limit,
      type,
    });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------------------------

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
      videoUrl,
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
      `[video Analysis Controller] Mencari komentar untuk analysisId: ${analysisId}`,
    );

    if (!analysisId) {
      throw new BadRequestError('Parameter "analysisId" diperlukan.');
    }

    const comments = await videoAnalysisService.getAnalysisResults(
      analysisId,
      userId,
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
      analysisId,
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
      commentInDb.youtubeCommentId, // Gunakan youtubeCommentId yang didapat dari DB
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
  startAnalysis,
  getAnalysisStatus,
  getAnalysisResults,
  submitVideoForAnalysis,
  getAnalyzedCommentsForVideo,
  batchDeleteJudiCommentsController,
  deleteAnalyzedCommentController,
};
