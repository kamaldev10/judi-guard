// src/api/services/videoAnalysis.service.js
const User = require("../../models/User.model");
const VideoAnalysis = require("../../models/VideoAnalysis.model");
const AnalyzedComment = require("../../models/AnalyzedComment.model");
const youtubeService = require("./youtube.service");
const { getYouTubeVideoId } = require("../../utils/youtubeHelper");
const {
  AppError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../../utils/errors"); // <-- TAMBAHKAN ForbiddenError DI SINI
const config = require("../../config/environment");
const { processAndSaveSingleComment } = require("../../utils/commentProcessor");
const aiService = require("./ai.service");

/**
 * Memulai proses analisis HANYA untuk komentar tingkat atas (top-level comments)
 * dengan alur kerja yang dioptimalkan untuk performa.
 */
const startVideoAnalysis = async (userId, youtubeVideoUrl) => {
  // --- Bagian 1: Setup Awal dan Validasi (Tetap Sama) ---
  const youtubeVideoId = getYouTubeVideoId(youtubeVideoUrl);
  if (!youtubeVideoId) {
    throw new BadRequestError(
      "URL Video YouTube tidak valid atau format tidak didukung."
    );
  }

  const youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(
    userId
  );

  let analysisEntry = await VideoAnalysis.create({
    userId,
    youtubeVideoId,
    status: "PENDING",
  });

  try {
    analysisEntry.status = "PROCESSING";
    analysisEntry.processingStartedAt = Date.now();

    // Ambil detail video
    const videoDetails = await youtubeService.getVideoDetails(youtubeVideoId, {
      youtubeClient,
    });
    if (videoDetails?.snippet) {
      analysisEntry.videoTitle = videoDetails.snippet.title;
    }
    await analysisEntry.save();

    // --- Bagian 2: Ambil Semua Top-Level Comments dari YouTube ---
    const commentThreads = await youtubeService.fetchCommentsForVideo(
      youtubeVideoId,
      userId,
      { youtubeClient },
      20, // maxResults per page
      config.MAX_TOP_LEVEL_COMMENTS || 50 // total comments to fetch
    );

    analysisEntry.totalCommentsFetched = commentThreads.length;
    await analysisEntry.save();

    if (commentThreads.length === 0) {
      console.log(
        `[VideoAnalysis-${analysisEntry._id}] Tidak ada komentar ditemukan. Analisis selesai.`
      );
      analysisEntry.status = "COMPLETED";
      analysisEntry.completedAt = Date.now();
      await analysisEntry.save();
      return analysisEntry.toObject();
    }
    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Berhasil mengambil ${commentThreads.length} top-level comments.`
    );

    // --- Bagian 3: Ekstrak, Analisis, dan Simpan Secara Optimal ---

    // 3a. Ekstrak hanya informasi yang kita butuhkan dari respons YouTube API
    const commentsToProcess = commentThreads
      .map((thread) => thread?.snippet?.topLevelComment)
      .filter((comment) => comment && comment.id && comment.snippet); // Filter item yang tidak valid

    // 3b. Cek duplikat di database dalam satu query besar untuk efisiensi
    const existingCommentIds = (
      await AnalyzedComment.find({
        youtubeCommentId: { $in: commentsToProcess.map((c) => c.id) },
      }).select("youtubeCommentId -_id")
    ).map((c) => c.youtubeCommentId);

    // 3c. Filter hanya komentar yang BENAR-BENAR BARU dan belum ada di database kita
    const newComments = commentsToProcess.filter(
      (c) => !existingCommentIds.includes(c.id)
    );

    if (newComments.length === 0) {
      console.log(
        `[VideoAnalysis-${analysisEntry._id}] Semua komentar yang diambil sudah pernah dianalisis sebelumnya. Selesai.`
      );
      // Tetap update status, karena proses fetch berhasil
      analysisEntry.totalCommentsAnalyzed = 0; // Tidak ada yang baru dianalisis
      analysisEntry.status = "COMPLETED";
      analysisEntry.completedAt = Date.now();
      await analysisEntry.save();
      return analysisEntry.toObject();
    }

    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Memulai analisis AI untuk ${newComments.length} komentar baru...`
    );

    // 3d. Buat semua promise analisis secara bersamaan (concurrently)
    const analysisPromises = newComments.map((comment) =>
      aiService.analyzeTextWithAI(comment.snippet.textOriginal)
    );

    // 3e. Tunggu semua promise analisis AI selesai
    const aiResults = await Promise.all(analysisPromises);

    // 3f. Siapkan data untuk disimpan secara massal
    const commentsToSave = newComments.map((comment, index) => {
      const aiResult = aiResults[index];
      return {
        videoAnalysisId: analysisEntry._id,
        userId,
        youtubeVideoId,
        youtubeCommentId: comment.id,
        parentYoutubeCommentId: null, // Selalu null karena kita hanya proses top-level
        commentTextOriginal: comment.snippet.textOriginal,
        commentTextDisplay: comment.snippet.textDisplay,
        commentAuthorDisplayName: comment.snippet.authorDisplayName,
        commentAuthorChannelId: comment.snippet.authorChannelId?.value,
        commentAuthorProfileImageUrl: comment.snippet.authorProfileImageUrl,
        commentPublishedAt: new Date(comment.snippet.publishedAt),
        commentUpdatedAt: new Date(comment.snippet.updatedAt),
        likeCount: comment.snippet.likeCount || 0,
        classification: aiResult.classification,
        aiConfidenceScore: aiResult.confidenceScore,
        aiModelVersion: aiResult.modelVersion,
      };
    });

    // 3g. Simpan semua komentar baru dalam satu operasi database (bulk insert)
    if (commentsToSave.length > 0) {
      await AnalyzedComment.insertMany(commentsToSave, { ordered: false });
    }

    // --- Bagian 4: Finalisasi (Tetap Sama) ---
    analysisEntry.totalCommentsAnalyzed = commentsToSave.length;
    analysisEntry.status = "COMPLETED";
    analysisEntry.completedAt = Date.now();
    await analysisEntry.save();

    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Analisis selesai. Total komentar BARU dianalisis: ${commentsToSave.length}.`
    );

    return analysisEntry.toObject();
  } catch (error) {
    // --- Blok Error Handling (Tetap Sama) ---
    console.error(
      `[VideoAnalysis-${analysisEntry?._id || "NEW"}] Terjadi error besar:`,
      error.stack
    );
    if (analysisEntry) {
      analysisEntry.status = "FAILED";
      analysisEntry.errorMessage = error.message;
      await analysisEntry
        .save()
        .catch((saveErr) =>
          console.error(`Gagal menyimpan status FAILED:`, saveErr)
        );
    }
    // Asumsi Anda punya error handler kustom, jika tidak, lempar error biasa
    // if (error instanceof AppError) throw error;
    throw error;
  }
};

// Fungsi getAnalysisResults (tidak banyak berubah, hanya memastikan sort order dan return value)
/**
 * Mengambil semua komentar dan balasan yang telah dianalisis untuk sebuah VideoAnalysis.
 * @param {string} videoAnalysisId - ID dari VideoAnalysis.
 * @param {string} userId - ID User Judi Guard yang memiliki analisis tersebut.
 * @returns {Promise<Array<object>>} Array objek AnalyzedComment (POJO), diurutkan berdasarkan tanggal publikasi.
 */
const getAnalysisResults = async (videoAnalysisId, userId) => {
  const videoAnalysis = await VideoAnalysis.findOne({
    _id: videoAnalysisId,
    userId: userId,
  });

  if (!videoAnalysis) {
    throw new NotFoundError(
      "Data analisis video tidak ditemukan atau Anda tidak memiliki akses."
    );
  }

  // Mengambil semua komentar dan balasan yang terkait dengan videoAnalysisId ini
  const analyzedCommentsAndReplies = await AnalyzedComment.find({
    videoAnalysisId: videoAnalysisId,
  }).sort({ commentPublishedAt: "asc" }); // Urutkan menaik (asc) untuk kronologis dari lama ke baru

  return analyzedCommentsAndReplies.map((comment) => comment.toObject());
};

/**
 * Memulai proses penghapusan semua komentar yang diklasifikasikan sebagai "judi"
 * untuk sebuah VideoAnalysis tertentu secara paralel.
 * @param {string} userId - ID User Judi Guard yang meminta.
 * @param {string} videoAnalysisId - ID dari VideoAnalysis.
 * @returns {Promise<object>} Objek yang berisi ringkasan hasil operasi.
 */
const requestBatchDeleteJudiComments = async (userId, videoAnalysisId) => {
  // 1. Verifikasi bahwa VideoAnalysis ada dan milik user yang meminta
  const videoAnalysis = await VideoAnalysis.findOne({
    _id: videoAnalysisId,
    userId: userId,
  });

  if (!videoAnalysis) {
    throw new NotFoundError(
      "Data analisis video tidak ditemukan atau Anda tidak memiliki akses."
    );
  }

  // 2. Dapatkan YouTube client yang terautentikasi (hanya sekali di awal)
  let youtubeClient;
  try {
    youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);
  } catch (authError) {
    console.error(
      `[VideoAnalysis-${videoAnalysisId}] Error autentikasi YouTube untuk batch delete:`,
      authError.message
    );
    throw authError; // Teruskan error autentikasi
  }

  // 3. Ambil semua komentar yang akan dihapus
  const classificationForJudi = "JUDI"; // Definisikan sebagai konstanta
  const commentsToBatchDelete = await AnalyzedComment.find({
    videoAnalysisId: videoAnalysisId,
    classification: classificationForJudi,
    isDeletedOnYoutube: { $ne: true }, // Hanya yang belum ditandai terhapus
  });

  // Jika tidak ada komentar yang perlu dihapus, langsung selesaikan
  if (commentsToBatchDelete.length === 0) {
    return {
      message: `Tidak ada komentar baru berkategori '${classificationForJudi}' yang perlu dihapus.`,
      totalTargeted: 0,
      successfullyDeleted: 0,
      failedToDelete: 0,
      failures: [],
    };
  }

  console.log(
    `[VideoAnalysis-${videoAnalysisId}] Memulai batch delete untuk ${commentsToBatchDelete.length} komentar '${classificationForJudi}'. User ID: ${userId}`
  );

  // Update status VideoAnalysis untuk menandakan proses sedang berjalan
  videoAnalysis.status = "DELETING_CLASSIFIED_COMMENTS";
  videoAnalysis.lastBatchDeletionAttemptAt = Date.now();
  await videoAnalysis.save();

  // 4. Buat array dari semua promise penghapusan
  const deletionPromises = commentsToBatchDelete.map(async (comment) => {
    try {
      // Tandai usaha penghapusan
      comment.deletionAttemptedAt = Date.now();

      // Panggil service untuk menghapus dari YouTube
      await youtubeService.deleteYoutubeComment(comment.youtubeCommentId, {
        youtubeClient,
      });

      // Jika berhasil, update status di DB kita
      comment.isDeletedOnYoutube = true;
      comment.deletionError = null;
      await comment.save();

      // Kembalikan objek sukses untuk Promise.allSettled
      return { commentId: comment.youtubeCommentId };
    } catch (error) {
      // Jika youtubeService.deleteYoutubeComment melempar error
      const errorMessage = error.message || "Unknown error during deletion";
      console.error(
        `[VideoAnalysisService] Gagal menghapus komentar ${comment.youtubeCommentId} dari YouTube:`,
        errorMessage
      );

      // Update status di DB kita bahwa terjadi error
      comment.isDeletedOnYoutube = false;
      comment.deletionError = errorMessage;
      await comment.save();

      // Lempar error yang berisi info berguna agar ditangkap oleh Promise.allSettled
      // Ini akan membuat status promise menjadi 'rejected'
      throw {
        commentId: comment.youtubeCommentId,
        reason: errorMessage,
      };
    }
  });

  // 5. Tunggu SEMUA promise penghapusan selesai, baik yang sukses maupun gagal
  const results = await Promise.allSettled(deletionPromises);

  // 6. Hitung hasil berdasarkan array results
  let successfullyDeletedCount = 0;
  let failedToDeleteCount = 0;
  const deletionFailures = [];

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      successfullyDeletedCount++;
    } else {
      // status === 'rejected'
      failedToDeleteCount++;
      // result.reason adalah objek error yang kita lempar dari blok catch di atas
      deletionFailures.push({
        youtubeCommentId: result.reason.commentId,
        error: result.reason.reason,
      });
    }
  });

  // 7. Update status akhir pada VideoAnalysis
  if (failedToDeleteCount > 0 && successfullyDeletedCount > 0) {
    videoAnalysis.status = "COMPLETED_DELETION_WITH_PARTIAL_ERRORS";
  } else if (failedToDeleteCount > 0 && successfullyDeletedCount === 0) {
    videoAnalysis.status = "FAILED_ALL_DELETIONS";
  } else if (failedToDeleteCount === 0 && successfullyDeletedCount > 0) {
    videoAnalysis.status = "COMPLETED_ALL_DELETIONS_SUCCESSFULLY";
  } else {
    // Jika tidak ada yang diproses (tidak seharusnya terjadi jika length > 0)
    videoAnalysis.status = "COMPLETED"; // Kembali ke status umum
  }

  // Simpan statistik penghapusan ke dokumen analisis utama
  videoAnalysis.lastBatchDeletionSuccessCount = successfullyDeletedCount;
  videoAnalysis.lastBatchDeletionFailureCount = failedToDeleteCount;
  videoAnalysis.completedAt = Date.now(); // Atau gunakan field `lastBatchDeletionCompletedAt`
  await videoAnalysis.save();

  console.log(
    `[VideoAnalysis-${videoAnalysisId}] Batch delete selesai. Berhasil: ${successfullyDeletedCount}, Gagal: ${failedToDeleteCount}.`
  );

  // 8. Kembalikan ringkasan hasil ke controller
  return {
    message: `Proses penghapusan komentar '${classificationForJudi}' selesai.`,
    totalTargeted: commentsToBatchDelete.length,
    successfullyDeleted: successfullyDeletedCount,
    failedToDelete: failedToDeleteCount,
    failures: deletionFailures,
  };
};

/**
 * Meminta penghapusan komentar yang sudah dianalisis dari YouTube.
 * @param {string} userId - ID User Judi Guard.
 * @param {string} analyzedCommentAppId - _id dari dokumen AnalyzedComment di database kita.
 * @returns {Promise<object>} Objek AnalyzedComment yang sudah diupdate.
 */
const requestDeleteYoutubeComment = async (userId, analyzedCommentAppId) => {
  // 1. Gunakan 'findOne' untuk mencari berdasarkan ID aplikasi DAN ID pengguna.
  // Ini secara otomatis memastikan hanya pengguna yang benar yang bisa menemukan (dan menghapus) komentar ini.
  const commentToDelete = await AnalyzedComment.findOne({
    _id: analyzedCommentAppId,
    userId: userId,
  });

  if (!commentToDelete) {
    throw new NotFoundError(
      `Komentar dengan ID aplikasi ${analyzedCommentAppId} tidak ditemukan atau Anda tidak memiliki akses.`
    );
  }

  // // 2. Verifikasi apakah komentar ini milik analisis yang diminta oleh user ini
  // if (commentToDelete.userId.toString() !== userId) {
  //   throw new ForbiddenError(
  //     "Anda tidak memiliki izin untuk menghapus komentar ini."
  //   );
  // }

  // 3. Jika sudah pernah ditandai terhapus, tidak perlu proses lagi (opsional, tergantung logika bisnis)
  if (commentToDelete.isDeletedOnYoutube) {
    console.log(
      `[VideoAnalysisService] Komentar ${commentToDelete.youtubeCommentId} sudah ditandai terhapus sebelumnya.`
    );
    return commentToDelete.toObject();
  }

  // 4. Dapatkan YouTube client yang terautentikasi untuk user
  let youtubeClient;
  try {
    youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);
  } catch (authError) {
    throw authError; // Teruskan error autentikasi
  }

  commentToDelete.deletionAttemptedAt = Date.now();

  try {
    // 5. Panggil youtubeService untuk menghapus komentar dari YouTube
    await youtubeService.deleteYoutubeComment(
      commentToDelete.youtubeCommentId,
      { youtubeClient }
    );

    // 6. Update status di database kita
    commentToDelete.isDeletedOnYoutube = true;
    commentToDelete.deletionError = null; // Hapus error sebelumnya jika ada
    console.log(
      `[VideoAnalysisService] Komentar ${commentToDelete.youtubeCommentId} berhasil dihapus dari YouTube & status di DB diupdate.`
    );
  } catch (error) {
    console.error(
      `[VideoAnalysisService] Gagal menghapus komentar ${commentToDelete.youtubeCommentId} dari YouTube:`,
      error.message
    );
    commentToDelete.isDeletedOnYoutube = false;
    commentToDelete.deletionError = error.message; // Simpan pesan error
    // Teruskan error agar controller bisa memberi respons yang sesuai
    // Tidak perlu save di sini jika errornya akan di-throw dan tidak ada perubahan state penting lainnya.
    // Jika kita ingin menyimpan deletionAttemptedAt dan deletionError, maka save perlu.
    await commentToDelete.save(); // Simpan usaha penghapusan dan errornya
    throw error; // Teruskan error asli dari youtubeService (misalnya AppError dengan status code yang sesuai)
  }

  await commentToDelete.save();
  return commentToDelete.toObject();
};

module.exports = {
  startVideoAnalysis,
  getAnalysisResults,
  requestBatchDeleteJudiComments,
  requestDeleteYoutubeComment,
};
