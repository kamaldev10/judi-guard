import { AppError, BadRequestError } from '#shared/utils/errors.js';
import { generateModerationReport, generatePeriodReport } from '#shared/utils/pdf-generator.js';
import { AnalyzedCommentRepository } from './analyzed-comment.repository.js';
import { VideoAnalysisRepository } from './video-analysis.repository.js';
import * as videoAnalysisService from './video-analysis.service.js';
import * as youtubeService from '#shared/services/youtube.service.js';

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
    videoAnalysisService
      .processAnalysis({
        analysisId: analysisRecord._id,
        videoId,
        tokens,
        userId,
      })
      .catch((err) => {
        // Error handling khusus background process (Log only)
        console.error('Background Analysis Failed:', err);
      });

    // 4. Response ke Frontend
    res.status(202).json({
      status: 'success',
      message: 'Permintaan analisis diterima dan sedang diproses.',
      data: {
        analysisId: analysisRecord._id,
        videoId: videoId,
        status: 'PROCESSING',
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

    const analysis = await VideoAnalysisRepository.findById(analysisId).select(
      'status totalCommentsFetched totalCommentsAnalyzed totalSpamDetected errorMessage completedAt moderationStatus',
    );

    if (!analysis) {
      throw new AppError('Data analisis tidak ditemukan.', 404);
    }

    res.status(200).json({
      status: 'success',
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

    const analysisHeader = await VideoAnalysisRepository.findById(analysisId);
    if (!analysisHeader) {
      throw new AppError('Data analisis tidak ditemukan.', 404);
    }

    const data = await videoAnalysisService.getAnalysisResults(analysisId, req.query);

    res.status(200).json({
      status: 'success',
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
    const { commentIds, action, banAuthor = false } = req.body;
    const tokens = req.youtubeTokens;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      throw new AppError('Daftar ID komentar (commentIds) wajib diisi array.', 400);
    }
    if (!action) {
      throw new AppError('Jenis aksi (action) wajib diisi.', 400);
    }

    const result = await videoAnalysisService.executeModerationAction(
      tokens,
      analysisId,
      commentIds,
      action,
      banAuthor,
    );

    res.status(200).json({
      status: 'success',
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
      throw new AppError('Daftar ID komentar (commentIds) wajib diisi array.', 400);
    }

    const result = await videoAnalysisService.executeUndoAction(tokens, analysisId, commentIds);

    res.status(200).json({
      status: 'success',
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
    const history = await VideoAnalysisRepository.find({ userId })
      .sort({ requestedAt: -1 }) // Terbaru di atas
      .skip(skip)
      .limit(parseInt(limit));

    const total = await VideoAnalysisRepository.countDocuments({ userId });

    res.status(200).json({
      status: 'success',
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

/**
 * 1. GET Report Preview (JSON Data)
 * Query: ?startDate=2023-01-01&endDate=2023-01-31
 */
const getReportPreview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    if (!startDate || !endDate) throw new AppError('Periode tanggal wajib diisi', 400);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include full end day

    // Query Aggregasi
    const analyses = await VideoAnalysisRepository.find({
      userId,
      requestedAt: { $gte: start, $lte: end },
      status: 'COMPLETED',
    }).sort({ requestedAt: -1 });

    // Hitung Summary
    const summary = {
      totalVideos: analyses.length,
      totalComments: analyses.reduce((acc, curr) => acc + curr.totalCommentsAnalyzed, 0),
      totalSpam: analyses.reduce((acc, curr) => acc + curr.totalSpamDetected, 0),
      period: { start, end },
    };

    res.status(200).json({
      status: 'success',
      data: {
        summary,
        details: analyses, // List video untuk tabel preview
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. GET Download Report (PDF Blob)
 */
const downloadPeriodReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    if (!startDate || !endDate) throw new AppError('Periode tanggal wajib diisi', 400);

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // 1. Ambil Analisis (Hanya yang ada spamnya agar laporan fokus)
    const analyses = await VideoAnalysisRepository.find({
      userId,
      requestedAt: { $gte: start, $lte: end },
      status: 'COMPLETED',
    }).sort({ requestedAt: 1 });

    // 2. Deep Fetch: Ambil Detail Komentar HANYA jika ada spam
    const detailsWithComments = await Promise.all(
      analyses.map(async (analysis) => {
        let spamComments = [];

        // Efisiensi: Cuma fetch komentar kalau memang terdeteksi spam
        if (analysis.totalSpamDetected > 0) {
          spamComments = await AnalyzedCommentRepository.find({
            analysisId: analysis._id,
            classification: 'JUDI',
          })
            .select('commentAuthorDisplayName commentTextDisplay riskLevel actionTaken')
            .limit(50);
        }

        return {
          ...analysis.toObject(),
          spamComments,
        };
      }),
    );

    // 3. Hitung Global Summary
    const summary = {
      totalVideos: analyses.length,
      totalComments: analyses.reduce((acc, curr) => acc + curr.totalCommentsAnalyzed, 0),
      totalSpam: analyses.reduce((acc, curr) => acc + curr.totalSpamDetected, 0),
    };

    const reportData = {
      user: { name: req.user.name || 'Member' },
      period: { start, end },
      summary,
      details: detailsWithComments,
    };

    generatePeriodReport(reportData, res);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Detail_Spam.pdf`);
  } catch (error) {
    next(error);
  }
};

const downloadReport = async (req, res, next) => {
  try {
    const { analysisId } = req.params;

    // 1. Ambil Data Header
    const analysisData = await VideoAnalysisRepository.findById(analysisId);
    if (!analysisData) throw new AppError('Data analisis tidak ditemukan', 404);

    // 2. Ambil Daftar Komentar SPAM (Yang Risk High/Medium)
    const comments = await AnalyzedCommentRepository.find({
      analysisId: analysisId,
      classification: 'JUDI',
    }).limit(200); // Batasi 200 biar PDF generation cepat

    if (!comments) {
      throw new AppError('Gagal mengambil data komentar', 500);
    }

    // 3. Set Header Response agar Browser download file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Laporan_Spam_${analysisId}.pdf`);

    // 4. Generate PDF
    generateModerationReport(analysisData, comments, res);
  } catch (error) {
    next(error);
  }
};
// -------END OF NEW LOGIC---------------------------

// ------------------ OLD LOGIC --------------------
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

    const analysisResult = await videoAnalysisService.startVideoAnalysis(userId, videoUrl);

    res.status(200).json({
      status: 'success',
      message: 'Analisis video telah dimulai dan selesai diproses.', // Sesuaikan pesan jika prosesnya background
      data: analysisResult, // Mengembalikan detail VideoAnalysis
    });
  } catch (error) {
    console.error('[Controller] Error saat submitVideoForAnalysis:', error);
    next(error);
  }
};

/**
 * Mengambil hasil komentar yang sudah dianalisis untuk sebuah VideoAnalysisRepository.
 */
const getAnalyzedCommentsForVideo = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user._id; // Dari middleware isAuthenticated

    console.log(`[video Analysis Controller] Mencari komentar untuk analysisId: ${analysisId}`);

    if (!analysisId) {
      throw new BadRequestError('Parameter "analysisId" diperlukan.');
    }

    const comments = await videoAnalysisService.getAnalysisResults(analysisId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Data komentar hasil analisis berhasil diambil.',
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
      throw new BadRequestError('Parameter analysisId diperlukan.');
    }

    const result = await videoAnalysisService.requestBatchDeleteJudiComments(userId, analysisId);

    res.status(204).json({
      success: true,
      message: result.message || "Proses penghapusan massal komentar 'judi' telah diproses.",
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
    const commentInDb = await AnalyzedCommentRepository.findOne({
      _id: analyzedCommentId,
      userId,
    });
    if (!commentInDb) {
      return res.status(404).json({
        status: 'error',
        message: 'Komentar tidak ditemukan di database Anda.',
      });
    }

    // Panggil service layer untuk menghapus atau memoderasi
    const result = await videoAnalysisService.requestDeleteYoutubeComment(
      userId,
      analyzedCommentId,
      commentInDb.youtubeCommentId, // Gunakan youtubeCommentId yang didapat dari DB
    );

    let successMessage = 'Komentar berhasil diproses.';
    if (result.isDeletedOnYoutube) {
      successMessage = 'Komentar berhasil dihapus permanen.';
    } else if (result.isModeratedOnYoutube) {
      successMessage = 'Komentar berhasil disembunyikan (dimoderasi) sebagai spam di video Anda.';
    }

    res.status(200).json({
      status: 'success',
      message: successMessage,
      data: {
        youtubeCommentId: result.youtubeCommentId,
        isDeletedOnYoutube: result.isDeletedOnYoutube,
        isModeratedOnYoutube: result.isModeratedOnYoutube,
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Delete/Moderate Comment Error di Controller:', {
      params: req.params,
      error: error.message,
      stack: error.stack,
    });

    // Sesuaikan status code berdasarkan jenis error
    const statusCode = error.code || error.status || 500;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Gagal menghapus atau memoderasi komentar.',
      details: error.details,
    });
    next(error);
  }
};

export {
  startAnalysis,
  getAnalysisStatus,
  getAnalysisResults,
  executeAction,
  undoAction,
  getHistory,
  downloadReport,
  getReportPreview,
  downloadPeriodReport,
  submitVideoForAnalysis,
  getAnalyzedCommentsForVideo,
  batchDeleteJudiCommentsController,
  deleteAnalyzedCommentController,
};
