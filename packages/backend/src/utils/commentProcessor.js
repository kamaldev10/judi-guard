// src/utils/commentProcessor.js

// Impor model dan service yang dibutuhkan oleh helper ini
// Pastikan path ini benar relatif terhadap lokasi file utils Anda
const AnalyzedComment = require("../api/models/AnalyzedComment.model");
const aiService = require("../api/services/ai.service"); // Asumsi aiService ada di sini

/**
 * Helper function untuk memproses (cek duplikasi, analisis AI) dan menyimpan satu komentar
 * (baik itu komentar tingkat atas maupun balasan) ke dalam database.
 *
 * @async
 * @function processAndSaveSingleComment
 * @param {object} commentResourceSnippet - Objek snippet dari Comment resource YouTube API.
 * @param {string} commentYoutubeIdParam - ID unik komentar dari YouTube.
 * @param {string} videoAnalysisId - ID dari entri VideoAnalysis saat ini.
 * @param {string} userId - ID pengguna Judi Guard yang melakukan analisis.
 * @param {string} youtubeVideoId - ID video YouTube tempat komentar ini berasal.
 * @param {string} [parentYoutubeCommentIdForDb=null] - ID komentar YouTube induk jika ini adalah balasan.
 * @returns {Promise<{isNew: boolean, classification: string, analyzedCommentId: string|null}>}
 * Objek yang mengindikasikan apakah komentar ini baru dianalisis (`isNew`),
 * klasifikasinya, dan ID dokumen AnalyzedComment di database.
 * @throws {Error} Jika parameter penting tidak valid atau terjadi kesalahan tak terduga.
 */
async function processAndSaveSingleComment(
  commentResourceSnippet,
  commentYoutubeIdParam,
  videoAnalysisId,
  userId,
  youtubeVideoId,
  parentYoutubeCommentIdForDb = null
) {
  // Log awal untuk debugging parameter yang diterima
  // console.log(
  //   `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Menerima untuk diproses: commentYoutubeIdParam: ${commentYoutubeIdParam}, parentId: ${parentYoutubeCommentIdForDb}`
  // );

  // Validasi Kritis: Pastikan commentYoutubeIdParam ada dan valid.
  if (
    !commentYoutubeIdParam ||
    typeof commentYoutubeIdParam !== "string" ||
    commentYoutubeIdParam.trim() === ""
  ) {
    // console.error(
    //   `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] FATAL: commentYoutubeIdParam tidak valid. Diterima: '${commentYoutubeIdParam}'.`
    // );
    throw new Error(
      `processAndSaveSingleComment dipanggil dengan commentYoutubeIdParam yang tidak valid: '${commentYoutubeIdParam}'`
    );
  }
  // Validasi Kritis: Pastikan commentResourceSnippet ada.
  if (!commentResourceSnippet || typeof commentResourceSnippet !== "object") {
    // console.error(
    //   `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] FATAL: commentResourceSnippet tidak valid untuk commentYoutubeId: ${commentYoutubeIdParam}.`
    // );
    throw new Error(
      `processAndSaveSingleComment dipanggil dengan commentResourceSnippet yang tidak valid untuk commentYoutubeId: ${commentYoutubeIdParam}`
    );
  }

  const textOriginal = commentResourceSnippet.textOriginal;
  const textDisplay = commentResourceSnippet.textDisplay;

  if (typeof textOriginal !== "string" || typeof textDisplay !== "string") {
    console.error(
      `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Teks komentar (original/display) tidak valid untuk commentYoutubeId: ${commentYoutubeIdParam}.`
    );
    throw new Error(
      `Teks komentar tidak valid untuk commentYoutubeId: ${commentYoutubeIdParam}`
    );
  }

  // Cek apakah komentar sudah ada di database kita berdasarkan ID YouTube-nya
  let existingAnalyzedComment = await AnalyzedComment.findOne({
    youtubeCommentId: commentYoutubeIdParam,
  });

  if (existingAnalyzedComment) {
    console.log(
      `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Komentar/Balasan ID YouTube: ${commentYoutubeIdParam} sudah ada di DB. Skip analisis AI.`
    );
    return {
      isNew: false,
      classification: existingAnalyzedComment.classification,
      analyzedCommentId: existingAnalyzedComment._id.toString(),
    };
  }

  console.log(
    `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Memproses penyimpanan dan analisis AI untuk komentar/balasan baru ID YouTube: ${commentYoutubeIdParam}`
  );

  const newAnalyzedCommentData = {
    videoAnalysisId,
    userId,
    youtubeVideoId,
    youtubeCommentId: commentYoutubeIdParam,
    parentYoutubeCommentId: parentYoutubeCommentIdForDb,
    commentTextOriginal: textOriginal,
    commentTextDisplay: textDisplay,
    commentAuthorDisplayName: commentResourceSnippet.authorDisplayName,
    commentAuthorChannelId: commentResourceSnippet.authorChannelId?.value,
    commentAuthorProfileImageUrl: commentResourceSnippet.authorProfileImageUrl,
    commentPublishedAt: commentResourceSnippet.publishedAt
      ? new Date(commentResourceSnippet.publishedAt)
      : new Date(),
    commentUpdatedAt: commentResourceSnippet.updatedAt
      ? new Date(commentResourceSnippet.updatedAt)
      : new Date(),
    likeCount: commentResourceSnippet.likeCount || 0,
    classification: "PENDING_ANALYSIS",
  };

  const newAnalyzedComment = await AnalyzedComment.create(
    newAnalyzedCommentData
  );

  try {
    if (!aiService || typeof aiService.analyzeCommentText !== "function") {
      throw new Error(
        "aiService atau metode analyzeCommentText tidak terdefinisi."
      );
    }
    const aiResult = await aiService.analyzeCommentText(
      newAnalyzedComment.commentTextDisplay
    );
    if (aiResult && typeof aiResult.classification === "string") {
      newAnalyzedComment.classification = aiResult.classification.toUpperCase();
      newAnalyzedComment.aiConfidenceScore = aiResult.confidenceScore;
      newAnalyzedComment.aiModelVersion = aiResult.modelVersion;
    } else {
      console.error(
        `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Hasil AI tidak valid untuk komentar ${commentYoutubeIdParam}:`,
        aiResult
      );
      newAnalyzedComment.classification = "ERROR_ANALYSIS";
    }
  } catch (aiError) {
    console.error(
      `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Gagal analisis AI untuk komentar ${commentYoutubeIdParam}:`,
      aiError.message,
      aiError.stack
    );
    newAnalyzedComment.classification = "ERROR_ANALYSIS";
  }

  await newAnalyzedComment.save();
  console.log(
    `[CommentProcessor][VideoAnalysis-${videoAnalysisId}] Komentar/Balasan ID YouTube: ${commentYoutubeIdParam} selesai diproses dan disimpan sebagai: ${newAnalyzedComment.classification}`
  );
  return {
    isNew: true,
    classification: newAnalyzedComment.classification,
    analyzedCommentId: newAnalyzedComment._id.toString(),
  };
}

// Ekspor fungsi helper agar bisa digunakan di tempat lain
module.exports = {
  processAndSaveSingleComment,
};
