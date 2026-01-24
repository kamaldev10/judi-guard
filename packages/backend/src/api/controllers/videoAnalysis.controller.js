// src/api/controllers/videoAnalysis.controller.js
const videoAnalysisService = require("../services/videoAnalysis.service");
const youtubeService = require("../services/youtube.service");
const { BadRequestError, NotFoundError } = require("../../utils/errors");
const AnalyzedComment = require("../models/AnalyzedComment.model");
const VideoAnalysis = require("../models/VideoAnalysis.model");
const generateModerationReport = require("../../utils/pdfGenerator");

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

    // Validasi kepemilikan (Opsional tapi recommended)
    // Cek apakah analysisId ini milik user yang sedang login
    const analysisHeader = await VideoAnalysis.findById(analysisId);
    if (!analysisHeader) {
      throw new AppError("Data analisis tidak ditemukan.", 404);
    }

    const data = await videoAnalysisService.getAnalysisResults(
      analysisId,
      req.query,
    );

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @body { commentIds: [...], action: "DELETE", banAuthor: true }
 */
const executeAction = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    // Ambil banAuthor dari body (default false jika tidak dikirim)
    const { commentIds, action, banAuthor = false } = req.body;
    const tokens = req.youtubeTokens;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      throw new AppError(
        "Daftar ID komentar (commentIds) wajib diisi array.",
        400,
      );
    }
    if (!action) {
      throw new AppError("Jenis aksi (action) wajib diisi.", 400);
    }

    // Teruskan banAuthor ke Service
    const result = await videoAnalysisService.executeModerationAction(
      tokens,
      analysisId,
      commentIds,
      action,
      banAuthor, // <--- Passing ke Service
    );

    res.status(200).json({
      status: "success",
      message: `Berhasil memproses ${action} (Ban: ${banAuthor}) untuk ${result.requested} komentar.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mengembalikan komentar ke status Published (Undo Delete/Hold)
 * @route   POST /api/analysis/:analysisId/undo
 * @body    { commentIds: ["id1", "id2"] }
 */
const undoAction = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const { commentIds } = req.body;
    const tokens = req.youtubeTokens;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      throw new AppError(
        "Daftar ID komentar (commentIds) wajib diisi array.",
        400,
      );
    }

    const result = await videoAnalysisService.executeUndoAction(
      tokens,
      analysisId,
      commentIds,
    );

    res.status(200).json({
      status: "success",
      message: `Berhasil mengembalikan (Undo) ${result.requested} komentar menjadi Published.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    menampilkan daftar video yang pernah dianalisis user beserta status akhirnya (Cleaned/Not Cleaned)
 * @route   GET /api/analysis/history
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id; // Dari middleware protect
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Cari riwayat milik user tersebut
    const history = await VideoAnalysis.find({ userId })
      .sort({ requestedAt: -1 }) // Terbaru di atas
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VideoAnalysis.countDocuments({ userId });

    res.status(200).json({
      status: "success",
      data: {
        history,
        pagination: {
          page: parseInt(page),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const { analysisId } = req.params;

    // 1. Ambil Data Header
    const analysisData = await VideoAnalysis.findById(analysisId);
    if (!analysisData) throw new AppError("Data analisis tidak ditemukan", 404);

    // 2. Ambil Daftar Komentar SPAM (Yang Risk High/Medium)
    const comments = await AnalyzedComment.find({
      analysisId: analysisId,
      classification: "JUDI",
    }).limit(200); // Batasi 200 biar PDF generation cepat

    // 3. Set Header Response agar Browser download file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Laporan_Spam_${analysisId}.pdf`,
    );

    // 4. Generate PDF
    generateModerationReport(analysisData, comments, res);
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
  executeAction,
  undoAction,
  getHistory,
  downloadReport,
  submitVideoForAnalysis,
  getAnalyzedCommentsForVideo,
  batchDeleteJudiCommentsController,
  deleteAnalyzedCommentController,
};
