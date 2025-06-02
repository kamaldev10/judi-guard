// src/api/services/videoAnalysis.service.js
const User = require("../../models/User.model");
const VideoAnalysis = require("../../models/VideoAnalysis.model");
const AnalyzedComment = require("../../models/AnalyzedComment.model");
const youtubeService = require("./youtube.service");
const aiService = require("./ai.service");
const { getYouTubeVideoId } = require("../../utils/youtubeHelper");
const {
  AppError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../../utils/errors"); // <-- TAMBAHKAN ForbiddenError DI SINI

/**
 * Memulai proses analisis komentar untuk sebuah video YouTube.
 * @param {string} userId - ID User Judi Guard yang meminta analisis.
 * @param {string} youtubeVideoUrl - URL video YouTube.
 * @returns {Promise<object>} Objek VideoAnalysis yang sudah diproses.
 */
const startVideoAnalysis = async (userId, youtubeVideoUrl) => {
  const youtubeVideoId = getYouTubeVideoId(youtubeVideoUrl);
  if (!youtubeVideoId) {
    throw new BadRequestError(
      "URL Video YouTube tidak valid atau format tidak didukung."
    );
  }

  // 1. Dapatkan YouTube client yang terautentikasi untuk user
  // Fungsi ini juga akan menangani refresh token jika perlu
  let youtubeClient;
  try {
    youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);
  } catch (authError) {
    // Jika gagal mendapatkan client (misal, user perlu re-link akun YouTube)
    throw authError; // Teruskan error autentikasi
  }

  // 2. Buat entri VideoAnalysis awal
  let analysisEntry = await VideoAnalysis.create({
    userId,
    youtubeVideoId,
    status: "PENDING",
  });

  console.log(
    `[VideoAnalysis-${analysisEntry._id}] Memulai analisis untuk video: ${youtubeVideoId} oleh user: ${userId}`
  );

  try {
    analysisEntry.status = "PROCESSING";
    analysisEntry.processingStartedAt = Date.now();
    await analysisEntry.save();

    // 3. Ambil detail video (opsional, tapi bagus untuk metadata)
    try {
      const videoDetails = await youtubeService.getVideoDetails(
        youtubeVideoId,
        { youtubeClient }
      );
      if (videoDetails && videoDetails.snippet) {
        analysisEntry.videoTitle = videoDetails.snippet.title;
        await analysisEntry.save();
        console.log(
          `[VideoAnalysis-${analysisEntry._id}] Judul video: ${analysisEntry.videoTitle}`
        );
      }
    } catch (videoDetailError) {
      console.warn(
        `[VideoAnalysis-${analysisEntry._id}] Gagal mengambil detail video: ${videoDetailError.message}. Melanjutkan tanpa detail video.`
      );
      // Tidak menghentikan proses utama jika hanya detail video yang gagal
    }

    // 4. Ambil semua komentar (top-level) dari video
    // Batasi jumlah komentar yang diambil untuk V1 agar tidak terlalu lama, misal 200 komentar
    // Anda bisa membuat limit ini konfiguratif nanti.
    const commentsFromYouTube = await youtubeService.fetchCommentsForVideo(
      youtubeVideoId,
      { youtubeClient },
      100, // maxResultsPerPage (maks 100)
      200 // limitTotalResults (misal 200 untuk V1, atau lebih tinggi jika siap menangani)
    );

    analysisEntry.totalCommentsFetched = commentsFromYouTube.length;
    await analysisEntry.save();
    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Berhasil mengambil ${analysisEntry.totalCommentsFetched} komentar.`
    );

    // --- PENTING: Pertimbangan untuk Proses Asinkron ---
    // Untuk aplikasi produksi, langkah analisis setiap komentar di bawah ini
    // idealnya dijalankan sebagai background job (misalnya menggunakan message queue seperti BullMQ)
    // agar request HTTP awal bisa langsung merespons dengan analysisId,
    // dan frontend bisa melakukan polling untuk status.
    // Untuk V1 ini, kita akan melakukannya secara sekuensial dalam promise ini,
    // yang berarti request HTTP akan menunggu hingga semua selesai.
    // Ini bisa menyebabkan timeout jika komentar sangat banyak.
    // ----------------------------------------------------

    let commentsAnalyzedCount = 0;
    for (const commentThreadItem of commentsFromYouTube) {
      // Ganti nama variabel menjadi commentThreadItem
      let topLevelComment; // Variabel untuk menyimpan objek topLevelComment
      let commentIdForLog; // Variabel untuk ID yang akan dilog jika terjadi error

      try {
        // Pastikan commentThreadItem dan strukturnya ada
        if (
          !commentThreadItem ||
          !commentThreadItem.snippet ||
          !commentThreadItem.snippet.topLevelComment ||
          !commentThreadItem.snippet.topLevelComment.id
        ) {
          console.error(
            `[VideoAnalysis-${analysisEntry._id}] Struktur data commentThreadItem tidak lengkap atau tidak valid. Melewati item ini. Data:`,
            JSON.stringify(commentThreadItem, null, 2)
          );
          continue; // Lanjut ke item berikutnya
        }

        topLevelComment = commentThreadItem.snippet.topLevelComment;
        commentIdForLog = topLevelComment.id; // ID komentar yang sebenarnya
        const snippet = topLevelComment.snippet; // Snippet dari topLevelComment

        if (!snippet) {
          console.error(
            `[VideoAnalysis-${analysisEntry._id}] Snippet tidak ditemukan untuk komentar dengan ID: ${commentIdForLog}. Melewati komentar ini.`
          );
          // ... (logika untuk menandai error analisis) ...
          continue;
        }

        // Debugging: Log struktur snippet untuk memastikan
        // console.log(`[VideoAnalysis-${analysisEntry._id}] Memproses komentar ID: ${commentIdForLog}, Snippet:`, JSON.stringify(snippet, null, 2));

        // Cek apakah komentar sudah pernah dianalisis
        let existingAnalyzedComment = await AnalyzedComment.findOne({
          youtubeCommentId: commentIdForLog,
        });

        if (existingAnalyzedComment) {
          console.log(
            `[VideoAnalysis-${analysisEntry._id}] Komentar ${commentIdForLog} sudah ada, skip.`
          );
          commentsAnalyzedCount++;
          continue;
        }

        // Simpan komentar ke database
        const newAnalyzedComment = await AnalyzedComment.create({
          videoAnalysisId: analysisEntry._id,
          userId: userId,
          youtubeVideoId: youtubeVideoId,
          youtubeCommentId: commentIdForLog, // Gunakan ID dari topLevelComment
          commentTextOriginal: snippet.textOriginal, // Dari snippet topLevelComment
          commentTextDisplay: snippet.textDisplay, // Dari snippet topLevelComment
          commentAuthorDisplayName: snippet.authorDisplayName,
          commentAuthorChannelId: snippet.authorChannelId
            ? snippet.authorChannelId.value
            : null,
          commentAuthorProfileImageUrl: snippet.authorProfileImageUrl,
          commentPublishedAt: new Date(snippet.publishedAt),
          commentUpdatedAt: new Date(snippet.updatedAt),
          likeCount: snippet.likeCount,
          totalReplyCount: commentThreadItem.snippet.totalReplyCount || 0, // totalReplyCount ada di snippet thread
          classification: "PENDING_ANALYSIS",
        });

        const aiResult = await aiService.analyzeCommentText(
          newAnalyzedComment.commentTextDisplay
        );

        newAnalyzedComment.classification = aiResult.classification;
        newAnalyzedComment.aiConfidenceScore = aiResult.confidenceScore;
        newAnalyzedComment.aiModelVersion = aiResult.modelVersion;
        await newAnalyzedComment.save();

        commentsAnalyzedCount++;
        console.log(
          `[VideoAnalysis-${analysisEntry._id}] Komentar ${newAnalyzedComment.youtubeCommentId} dianalisis: ${aiResult.classification}`
        );
      } catch (commentError) {
        console.log(commentError.stack);
        const idToLog =
          commentIdForLog ||
          (commentThreadItem ? commentThreadItem.id : "UNKNOWN_THREAD_ID");
        console.error(
          `[VideoAnalysis-${analysisEntry._id}] Gagal memproses atau menganalisis komentar (Thread ID: ${idToLog}):`,
          commentError.message,
          commentError.stack
        ); // Tambahkan stack trace
        // Lanjutkan ke komentar berikutnya, jangan hentikan seluruh proses analisis
        // Anda bisa menandai komentar ini sebagai ERROR_ANALYSIS di database jika perlu
        try {
          // Coba buat entri dengan status error jika belum ada
          let errorCommentEntry = await AnalyzedComment.findOne({
            youtubeCommentId: commentData.id,
          });
          if (!errorCommentEntry && commentData.id) {
            // Pastikan commentData.id ada
            await AnalyzedComment.create({
              videoAnalysisId: analysisEntry._id,
              userId: userId,
              youtubeVideoId: youtubeVideoId,
              youtubeCommentId: commentData.id,
              commentTextOriginal: commentData.snippet.textOriginal || "N/A",
              commentTextDisplay: commentData.snippet.textDisplay || "N/A",
              classification: "ERROR_ANALYSIS",
            });
          } else if (errorCommentEntry) {
            errorCommentEntry.classification = "ERROR_ANALYSIS";
            await errorCommentEntry.save();
          }
        } catch (dbError) {
          console.error(
            `[VideoAnalysis-${analysisEntry._id}] Gagal menyimpan status error untuk komentar ${commentData.id}:`,
            dbError.message
          );
        }
      }
    }

    analysisEntry.totalCommentsAnalyzed = commentsAnalyzedCount;
    analysisEntry.status = "COMPLETED";
    analysisEntry.completedAt = Date.now();
    await analysisEntry.save();

    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Analisis selesai. Total komentar dianalisis: ${commentsAnalyzedCount}`
    );
    return analysisEntry.toObject(); // Kembalikan entri analisis yang sudah lengkap
  } catch (error) {
    console.error(
      `[VideoAnalysis-${analysisEntry._id}] Terjadi error saat proses analisis video:`,
      error
    );
    analysisEntry.status = "FAILED";
    analysisEntry.errorMessage = error.message;
    // Pastikan analysisEntry sudah tersimpan sebelum error ini
    if (analysisEntry && analysisEntry.save)
      await analysisEntry
        .save()
        .catch((saveErr) =>
          console.error("Failed to save FAILED status:", saveErr)
        );

    // Teruskan error agar bisa ditangani oleh controller
    // Sesuaikan tipe error jika perlu
    if (error instanceof AppError) throw error;
    throw new AppError(`Proses analisis video gagal: ${error.message}`, 500);
  }
};

/**
 * Mengambil hasil analisis komentar untuk sebuah VideoAnalysis.
 * @param {string} videoAnalysisId - ID dari VideoAnalysis.
 * @param {string} userId - ID User Judi Guard yang memiliki analisis tersebut.
 * @returns {Promise<Array<object>>} Array objek AnalyzedComment.
 */
const getAnalysisResults = async (videoAnalysisId, userId) => {
  // Pastikan videoAnalysisId ini milik userId yang meminta
  const videoAnalysis = await VideoAnalysis.findOne({
    _id: videoAnalysisId,
    userId: userId,
  });
  if (!videoAnalysis) {
    throw new NotFoundError(
      "Data analisis video tidak ditemukan atau Anda tidak memiliki akses."
    );
  }

  const analyzedComments = await AnalyzedComment.find({
    videoAnalysisId: videoAnalysisId,
  }).sort({ commentPublishedAt: -1 }); // Urutkan berdasarkan terbaru dulu (atau sesuai kebutuhan)

  return analyzedComments.map((comment) => comment.toObject());
};

/**
 * Meminta penghapusan komentar yang sudah dianalisis dari YouTube.
 * @param {string} userId - ID User Judi Guard.
 * @param {string} analyzedCommentAppId - _id dari dokumen AnalyzedComment di database kita.
 * @returns {Promise<object>} Objek AnalyzedComment yang sudah diupdate.
 */
const requestDeleteYoutubeComment = async (userId, analyzedCommentAppId) => {
  // 1. Ambil detail komentar yang akan dihapus dari database kita
  const commentToDelete = await AnalyzedComment.findById(analyzedCommentAppId);

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
  requestDeleteYoutubeComment,
};
