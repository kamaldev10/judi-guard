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
/**
 * Memulai proses analisis komentar untuk sebuah video YouTube.
 * (Deskripsi JSDoc lainnya tetap sama)
 */
const startVideoAnalysis = async (userId, youtubeVideoUrl) => {
  const youtubeVideoId = getYouTubeVideoId(youtubeVideoUrl);
  if (!youtubeVideoId) {
    throw new BadRequestError(
      "URL Video YouTube tidak valid atau format tidak didukung."
    );
  }

  let youtubeClient;
  try {
    youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);
  } catch (authError) {
    throw authError;
  }

  let analysisEntry = await VideoAnalysis.create({
    userId,
    youtubeVideoId,
    status: "PENDING",
  });
  // console.log(
  //   `[VideoAnalysis-${analysisEntry._id}] Memulai analisis untuk video: ${youtubeVideoId} oleh user: ${userId}`
  // );

  try {
    analysisEntry.status = "PROCESSING";
    analysisEntry.processingStartedAt = Date.now();
    await analysisEntry.save();

    // ... (logika ambil detail video tetap sama) ...
    try {
      const videoDetails = await youtubeService.getVideoDetails(
        youtubeVideoId,
        { youtubeClient }
      );
      if (videoDetails && videoDetails.snippet) {
        analysisEntry.videoTitle = videoDetails.snippet.title;
        await analysisEntry.save();
        console.log(
          `[VideoAnalysis-${analysisEntry._id}] Judul video berhasil diambil: ${analysisEntry.videoTitle}`
        );
      }
    } catch (videoDetailError) {
      console.warn(
        `[VideoAnalysis-${analysisEntry._id}] Gagal mengambil detail video: ${videoDetailError.message}. Proses analisis tetap dilanjutkan.`
      );
    }

    const commentThreads = await youtubeService.fetchCommentsForVideo(
      youtubeVideoId,
      userId,
      { youtubeClient },
      100,
      config.MAX_TOP_LEVEL_COMMENTS || 200
    );

    analysisEntry.totalCommentsFetched = commentThreads.length;
    await analysisEntry.save();
    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Berhasil mengambil ${analysisEntry.totalCommentsFetched} comment threads dari YouTube.`
    );

    let newlyAnalyzedCount = 0;
    let totalRepliesFound = 0; // Diubah dari totalRepliesProcessed agar lebih jelas

    for (const threadItem of commentThreads) {
      if (
        !threadItem?.snippet?.topLevelComment?.id ||
        !threadItem.snippet.topLevelComment.snippet
      ) {
        console.warn(
          `[VideoAnalysis] Struktur threadItem tidak valid. Dilewati.`
        );
        continue;
      }

      const topLevelCommentResource = threadItem.snippet.topLevelComment;

      // AMBIL ID DARI `topLevelComment`, BUKAN DARI `threadItem`
      const topLevelCommentYoutubeId = topLevelCommentResource.id; // Ini adalah ID dari komentar spesifik, bukan thread.

      // 1. Proses Komentar Tingkat Atas menggunakan ID yang benar
      try {
        const topLevelResult = await processAndSaveSingleComment(
          topLevelCommentResource.snippet,
          topLevelCommentYoutubeId, // <<< Pastikan variabel ini yang diteruskan
          analysisEntry._id.toString(),
          userId,
          youtubeVideoId,
          null
        );
        if (topLevelResult.isNew) newlyAnalyzedCount++;
      } catch (commentError) {
        console.error(
          `[VideoAnalysis-${analysisEntry._id}] GAGAL memproses top-level comment ID ${topLevelCommentYoutubeId}: ${commentError.message}`
        );
      }

      // 2. Proses Balasan Awal menggunakan helper
      const initialReplies = threadItem.replies?.comments || [];
      for (const replyResource of initialReplies) {
        if (!replyResource?.id || !replyResource.snippet) {
          console.warn(
            `[VideoAnalysis-${analysisEntry._id}] Struktur initial reply tidak valid untuk parent ${topLevelCommentYoutubeId}. Dilewati. Data:`,
            JSON.stringify(replyResource, null, 2)
          );
          continue;
        }
        try {
          const replyResult = await processAndSaveSingleComment(
            // Memanggil helper
            replyResource.snippet,
            replyResource.id,
            analysisEntry._id.toString(),
            userId,
            youtubeVideoId,
            topLevelCommentYoutubeId
          );
          if (replyResult.isNew) newlyAnalyzedCount++;
          totalRepliesFound++;
        } catch (replyError) {
          console.error(
            `[VideoAnalysis-${analysisEntry._id}] GAGAL (via helper) memproses initial reply ID ${replyResource.id} untuk parent ${topLevelCommentYoutubeId}: ${replyError.message} \nStack: ${replyError.stack}`
          );
        }
      }

      // 3. Jika totalReplyCount > jumlah balasan awal, fetch sisa balasan dan proses menggunakan helper
      const totalReplyCountOnThread = threadItem.snippet.totalReplyCount || 0;
      if (totalReplyCountOnThread > initialReplies.length) {
        console.log(
          `[VideoAnalysis-${analysisEntry._id}] Komentar ${topLevelCommentYoutubeId} memiliki ${totalReplyCountOnThread} balasan (terdeteksi ${initialReplies.length} balasan awal). Mengambil sisa balasan...`
        );
        try {
          let nextPageTokenForReplies = null;
          let fetchedAdditionalRepliesCount = 0;

          do {
            const repliesResponse = await youtubeService.fetchRepliesForComment(
              topLevelCommentYoutubeId,
              {
                userId,
                youtubeClient,
                pageToken: nextPageTokenForReplies,
                maxResults: 50,
              }
            );

            for (const replyResource of repliesResponse.replies) {
              if (!replyResource?.id || !replyResource.snippet) {
                console.warn(
                  `[VideoAnalysis-${analysisEntry._id}] Struktur fetched reply tidak valid untuk parent ${topLevelCommentYoutubeId}. Dilewati. Data:`,
                  JSON.stringify(replyResource, null, 2)
                );
                continue;
              }
              try {
                const replyResult = await processAndSaveSingleComment(
                  // Memanggil helper
                  replyResource.snippet,
                  replyResource.id,
                  analysisEntry._id.toString(),
                  userId,
                  youtubeVideoId,
                  topLevelCommentYoutubeId
                );
                if (replyResult.isNew) newlyAnalyzedCount++;
                fetchedAdditionalRepliesCount++;
                totalRepliesFound++;
              } catch (deepReplyError) {
                console.error(
                  `[VideoAnalysis-${analysisEntry._id}] GAGAL (via helper) memproses fetched reply ID ${replyResource.id} untuk parent ${topLevelCommentYoutubeId}: ${deepReplyError.message} \nStack: ${deepReplyError.stack}`
                );
              }
            }
            nextPageTokenForReplies = repliesResponse.nextPageToken;

            if (
              initialReplies.length + fetchedAdditionalRepliesCount >=
              (config.MAX_REPLIES_PER_COMMENT || 50)
            ) {
              console.warn(
                `[VideoAnalysis-${
                  analysisEntry._id
                }] Mencapai batas pengambilan balasan (${
                  initialReplies.length + fetchedAdditionalRepliesCount
                }) untuk komentar ${topLevelCommentYoutubeId}.`
              );
              break;
            }
          } while (nextPageTokenForReplies);
        } catch (fetchRepliesError) {
          console.error(
            `[VideoAnalysis-${analysisEntry._id}] Gagal mengambil sisa balasan untuk komentar ${topLevelCommentYoutubeId}: ${fetchRepliesError.message}`
          );
        }
      }
    } // Akhir loop for (const threadItem of commentThreads)

    analysisEntry.totalCommentsAnalyzed = newlyAnalyzedCount;
    analysisEntry.status = "COMPLETED";
    analysisEntry.completedAt = Date.now();
    await analysisEntry.save();

    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Analisis selesai. Total comment threads awal: ${commentThreads.length}. Total komentar/balasan BARU dianalisis AI: ${newlyAnalyzedCount}. Total semua balasan yang ditemukan/diproses: ${totalRepliesFound}.`
    );
    return analysisEntry.toObject();
  } catch (error) {
    console.error(
      `[VideoAnalysis-${
        analysisEntry?._id || "NEW"
      }] Terjadi error besar saat proses analisis video:`,
      error.stack
    );
    if (analysisEntry && analysisEntry._id) {
      analysisEntry.status = "FAILED";
      analysisEntry.errorMessage = error.message;
      await analysisEntry
        .save()
        .catch((saveErr) =>
          console.error(
            `[VideoAnalysis-${analysisEntry._id}] Gagal menyimpan status FAILED:`,
            saveErr
          )
        );
    }
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Proses analisis video gagal: ${error.message}`,
      error.code && typeof error.code === "number" ? error.code : 500
    );
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
 * untuk sebuah VideoAnalysis tertentu.
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

  // 2. Dapatkan YouTube client yang terautentikasi
  let youtubeClient;
  try {
    youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);
  } catch (authError) {
    // Jika gagal mendapatkan client (misal, user perlu re-link akun YouTube)
    console.error(
      `[VideoAnalysis-${videoAnalysisId}] Error autentikasi YouTube untuk batch delete:`,
      authError.message
    );
    throw authError; // Teruskan error autentikasi (mungkin AppError dari youtubeService)
  }

  // 3. Ambil semua komentar yang diklasifikasikan "judi" dan belum ditandai terhapus
  //    Pastikan klasifikasi 'judi' sesuai dengan yang Anda gunakan.
  const classificationForJudi = "JUDI"; // Definisikan sebagai konstanta agar mudah diubah
  const commentsToBatchDelete = await AnalyzedComment.find({
    videoAnalysisId: videoAnalysisId,
    userId: userId, // Pastikan komentar juga milik user ini untuk keamanan tambahan
    classification: classificationForJudi,
    isDeletedOnYoutube: { $ne: true }, // Hanya yang belum ditandai terhapus
  });

  if (commentsToBatchDelete.length === 0) {
    return {
      message: `Tidak ada komentar berkategori '${classificationForJudi}' yang perlu dihapus untuk analisis video ID: ${videoAnalysisId}.`,
      totalTargeted: 0,
      successfullyDeleted: 0,
      failedToDelete: 0,
      failures: [],
    };
  }

  console.log(
    `[VideoAnalysis-${videoAnalysisId}] Memulai batch delete untuk ${commentsToBatchDelete.length} komentar '${classificationForJudi}'. User ID: ${userId}`
  );

  // --- PERINGATAN PENTING UNTUK PRODUKSI ---
  // Iterasi penghapusan di bawah ini adalah operasi yang berpotensi berjalan lama
  // dan memakan banyak kuota API jika jumlah komentar banyak.
  // Untuk aplikasi produksi, SANGAT DISARANKAN menjalankan ini sebagai background job
  // (misalnya menggunakan message queue seperti BullMQ, RabbitMQ, atau Kue)
  // agar request HTTP awal bisa langsung merespons dengan cepat.
  // Frontend kemudian bisa melakukan polling atau menggunakan WebSockets untuk status.
  // Untuk V1 atau skala kecil, proses sekuensial ini mungkin bisa diterima dengan risiko timeout.
  // ---------------------------------------------------------------------------------------

  let successfullyDeletedCount = 0;
  let failedToDeleteCount = 0;
  const deletionFailures = [];

  // Update status VideoAnalysis (opsional, tapi informatif)
  const originalStatus = videoAnalysis.status;
  videoAnalysis.status = "DELETING_CLASSIFIED_COMMENTS"; // Status baru, misal 'DELETING_JUDI_COMMENTS'
  videoAnalysis.lastBatchDeletionAttemptAt = Date.now();
  await videoAnalysis.save();

  for (const comment of commentsToBatchDelete) {
    comment.deletionAttemptedAt = Date.now();
    try {
      await youtubeService.deleteYoutubeComment(comment.youtubeCommentId, {
        youtubeClient,
      });
      comment.isDeletedOnYoutube = true;
      comment.deletionError = null; // Bersihkan error sebelumnya jika ada
      await comment.save();
      successfullyDeletedCount++;
      console.log(
        `[VideoAnalysis-${videoAnalysisId}] Komentar YouTube ID ${comment.youtubeCommentId} (App ID: ${comment._id}) berhasil dihapus.`
      );
    } catch (error) {
      // Tangani error dari youtubeService.deleteYoutubeComment
      // Error ini bisa jadi AppError dengan status code yang sesuai atau error lainnya.
      comment.isDeletedOnYoutube = false;
      comment.deletionError =
        error.message || "Unknown error during YouTube comment deletion";
      await comment.save();
      failedToDeleteCount++;
      deletionFailures.push({
        analyzedCommentAppId: comment._id.toString(),
        youtubeCommentId: comment.youtubeCommentId,
        error: comment.deletionError,
      });
      console.error(
        `[VideoAnalysis-${videoAnalysisId}] Gagal menghapus komentar YouTube ID ${comment.youtubeCommentId} (App ID: ${comment._id}): ${comment.deletionError}`
      );
      // Lanjutkan ke komentar berikutnya, jangan hentikan seluruh proses batch
    }
  }

  // Update status akhir VideoAnalysis
  if (failedToDeleteCount > 0 && successfullyDeletedCount > 0) {
    videoAnalysis.status = "COMPLETED_DELETION_WITH_PARTIAL_ERRORS";
  } else if (failedToDeleteCount > 0 && successfullyDeletedCount === 0) {
    videoAnalysis.status = "FAILED_ALL_DELETIONS";
  } else if (failedToDeleteCount === 0 && successfullyDeletedCount > 0) {
    videoAnalysis.status = "COMPLETED_ALL_DELETIONS_SUCCESSFULLY";
  } else {
    // Jika tidak ada yang diproses (seharusnya sudah ditangani oleh pengecekan commentsToBatchDelete.length === 0)
    // atau kembali ke status original jika tidak ada perubahan signifikan.
    videoAnalysis.status = originalStatus; // Atau status lain yang sesuai
  }
  // Anda bisa juga menyimpan jumlah sukses/gagal di videoAnalysis
  videoAnalysis.lastBatchDeletionSuccessCount = successfullyDeletedCount;
  videoAnalysis.lastBatchDeletionFailureCount = failedToDeleteCount;
  videoAnalysis.processingEndedAt = Date.now(); // Atau field khusus deletionEndedAt
  await videoAnalysis.save();

  console.log(
    `[VideoAnalysis-${videoAnalysisId}] Batch delete untuk '${classificationForJudi}' selesai. Berhasil: ${successfullyDeletedCount}, Gagal: ${failedToDeleteCount}.`
  );

  return {
    message: `Proses penghapusan komentar '${classificationForJudi}' selesai untuk analisis video ID: ${videoAnalysisId}.`,
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
  // 1. Ambil detail komentar yang akan dihapus dari database kita
  const commentToDelete = await AnalyzedComment.findById({
    _id: analyzedCommentAppId,
    userId: userId,
  });

  if (!commentToDelete) {
    throw new NotFoundError(
      `Komentar dengan ID aplikasi ${analyzedCommentAppId} tidak ditemukan di database.`
    );
  }

  // 2. Verifikasi apakah komentar ini milik analisis yang diminta oleh user ini
  if (commentToDelete.userId.toString() !== userId) {
    throw new ForbiddenError(
      "Anda tidak memiliki izin untuk menghapus komentar ini."
    );
  }

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
