import { UserRepository } from '#modules/user/user.repository.js';
import { VideoAnalysisRepository } from './video-analysis.repository.js';
import { AnalyzedCommentRepository } from './analyzed-comment.repository.js';
import * as youtubeService from '#shared/services/youtube.service.js';
import { getYouTubeVideoId } from '#shared/utils/youtube-helper.js';
import { AppError, BadRequestError, NotFoundError, ForbiddenError } from '#shared/utils/errors.js';
import config from '#config/environment.js';
import * as aiService from '#shared/services/ai.service.js';
import mongoose from 'mongoose';

//* --- NEW LOGIC ----

/**
 * 1. Create Ticket (Status: PROCESSING)
 */
const createAnalysisRecord = async ({ userId, videoId, title, isGuest }) => {
  // Cek apakah sedang ada analisis berjalan untuk video yang sama?
  const existingProcess = await VideoAnalysisRepository.findOne({
    youtubeVideoId: videoId,
    status: 'PROCESSING',
    // Logic tambahan: Kalau guest, kita cek videoId aja. Kalau user, cek userId juga.
    ...(userId ? { userId } : {}),
  });

  if (existingProcess) {
    // Jika ada proses 'nyangkut' lebih dari 10 menit, kita anggap gagal dan timpa
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (existingProcess.createdAt < tenMinutesAgo) {
      await VideoAnalysisRepository.findByIdAndUpdate(existingProcess._id, {
        status: 'FAILED',
      });
    } else {
      throw new AppError('Video ini sedang dalam proses analisis.', 409);
    }
  }

  const newAnalysis = await VideoAnalysisRepository.create({
    userId: userId || null,
    isGuest: isGuest || false,
    youtubeVideoId: videoId,
    videoTitle: title,
    status: 'PROCESSING',
    moderationStatus: 'NONE',
    processingStartedAt: new Date(),
    totalCommentsFetched: 0,
    totalCommentsAnalyzed: 0,
    totalSpamDetected: 0,
  });

  return newAnalysis;
};

/**
 * 2. Process Analysis (Fetch -> Store -> Update Stats)
 */
const processAnalysis = async ({ analysisId, videoId, tokens, userId }) => {
  try {
    console.log(`[Video Analysis Service] Starting analysis for ${videoId}...`);

    // 1. Fetch Data dari YouTube
    const rawComments = await youtubeService.getAllComments(tokens, videoId);
    console.log(`[Video Analysis Service] Fetched ${rawComments.length} comments.`);

    // Update Tiket: Fetched
    await VideoAnalysisRepository.findByIdAndUpdate(analysisId, {
      totalCommentsFetched: rawComments.length,
    });

    if (rawComments.length === 0) {
      return await updateAnalysisStatus(analysisId, 'COMPLETED');
    }

    // 2. Mapping Data (Perbaikan Nama Field)
    const commentDocs = [];

    rawComments.forEach((thread) => {
      // Pastikan kita mengambil data dari properti yang benar
      // Cek youtube.service.js Anda, biasanya return 'text' bukan 'textDisplay' di object hasil map
      const top = thread.topLevelComment;

      // Data Top Level
      commentDocs.push({
        analysisId: analysisId,
        userId: userId || null, // Handle Guest (null)
        youtubeVideoId: videoId,

        youtubeCommentId: thread.threadId, // Gunakan ID Thread

        // MAPPING KUNCI: Samakan dengan Model!
        commentTextOriginal: top.text,
        commentTextDisplay: top.text,

        commentAuthorDisplayName: top.author.name,
        commentAuthorProfileImageUrl: top.author.avatar,
        commentAuthorChannelId: top.author.channelId,
        commentPublishedAt: top.publishedAt,
        likeCount: top.likeCount,

        parentYoutubeCommentId: null,
        processingStatus: 'UNPROCESSED',
        classification: 'UNKNOWN',
      });

      // Data Replies
      if (thread.replies && thread.replies.length > 0) {
        thread.replies.forEach((reply) => {
          commentDocs.push({
            analysisId: analysisId,
            userId: userId || null,
            youtubeVideoId: videoId,

            youtubeCommentId: reply.id,

            // MAPPING KUNCI
            commentTextOriginal: reply.text,
            commentTextDisplay: reply.text,

            commentAuthorDisplayName: reply.author.name,
            commentAuthorProfileImageUrl: reply.author.avatar,
            commentAuthorChannelId: reply.author.channelId,
            commentPublishedAt: reply.publishedAt,
            likeCount: reply.likeCount,

            parentYoutubeCommentId: thread.threadId, // Link ke Parent

            processingStatus: 'UNPROCESSED',
            classification: 'UNKNOWN',
          });
        });
      }
    });

    // 3. Simpan ke Database (HAPUS Try-Catch Silent untuk Debugging)
    // Kita biarkan error meledak disini supaya ketahuan apa yang salah
    if (commentDocs.length > 0) {
      console.log(`[Video Analysis Service] Upserting ${commentDocs.length} docs...`);

      const bulkOps = commentDocs.map((doc) => ({
        updateOne: {
          filter: { youtubeCommentId: doc.youtubeCommentId },
          update: {
            $set: doc, // Update data
            $setOnInsert: { createdAt: new Date() }, // Set created only on insert
          },
          upsert: true, // Kunci ajaib: Buat baru jika belum ada
        },
      }));

      await AnalyzedCommentRepository.bulkWrite(bulkOps);
      console.log(`[Video Analysis Service] Successfully Saved/Updated to DB.`);
    }

    // 4. Panggil AI (Sekarang AI pasti dapat data, karena status di-reset jadi UNPROCESSED oleh $set diatas)
    await aiService.runAiClassification(analysisId);

    // 5. Selesai
    await updateAnalysisStatus(analysisId, 'COMPLETED');
  } catch (error) {
    console.error(`[Video Analysis Service] FAILED DETAILS:`, error); // Log error lengkap

    // Abaikan error duplikat (E11000) agar status tetap COMPLETED
    if (error.code === 11000) {
      console.warn('Sebagian komentar sudah ada (Duplicate), melanjutkan ke AI...');
      await aiService.runAiClassification(analysisId);
      await updateAnalysisStatus(analysisId, 'COMPLETED');
    } else {
      // Error lain (Validasi/Koneksi) -> Status FAILED
      await updateAnalysisStatus(analysisId, 'FAILED', error.message);
    }
  }
};

/**
 * Helper: Update Status & Stats
 * @param {String} analysisId - ID Analisis
 * @param {String} status - New Status
 * @param {String} errorMessage - Optional Error Message
 * @param {Object} stats - Optional Statistik tambahan
 */
const updateAnalysisStatus = async (analysisId, status, errorMessage = null, stats = {}) => {
  const updateData = {
    status,
    ...stats, // Spread statistik tambahan jika ada (analyzed count, spam count)
  };

  if (status === 'COMPLETED' || status === 'FAILED') {
    updateData.completedAt = new Date();
  }

  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }

  await VideoAnalysisRepository.findByIdAndUpdate(analysisId, updateData);
};

/**
 * Mengambil detail komentar hasil analisis (Pagination + Filter)
 * @param {String} analysisId - ID Header Analisis
 * @param {Object} query - { page, limit, type }
 */
const getAnalysisResults = async (analysisId, query) => {
  const {
    page = 1,
    limit = 10,
    riskLevel, // Filter: HIGH, MEDIUM, LOW
    minConfidence, // Filter: 0.1 - 1.0
    actionTaken, // Filter: NONE, DELETE, HOLD
    search, // Search text
  } = query;

  const skip = (page - 1) * limit;

  // Build Query Object
  const filter = { analysisId };

  // 1. Filter Risk Level (Bisa multiple, misal riskLevel=HIGH,MEDIUM)
  if (riskLevel) {
    const levels = riskLevel.split(',');
    filter.riskLevel = { $in: levels };
  }

  // 2. Filter Min Confidence Score
  if (minConfidence) {
    filter.confidenceScore = { $gte: parseFloat(minConfidence) };
  }

  // 3. Filter Status Tindakan (Sudah dihapus atau belum)
  if (actionTaken) {
    filter.actionTaken = actionTaken;
  }

  // 4. Search Text
  if (search) {
    filter.commentTextDisplay = { $regex: search, $options: 'i' };
  }

  // Eksekusi Query
  const comments = await AnalyzedCommentRepository.find(filter)
    .sort({ confidenceScore: -1, createdAt: -1 }) // Urutkan dari yang paling spam
    .skip(skip)
    .limit(parseInt(limit));

  const totalItems = await AnalyzedCommentRepository.countDocuments(filter);

  return {
    comments,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      itemsPerPage: parseInt(limit),
    },
  };
};

/**
 * Eksekusi Moderasi (Bulk atau Single)
 * @param {Object} tokens - Token OAuth2
 * @param {String} analysisId - ID Analisis (Header)
 * @param {Array<String>} commentIds - Array ID MongoDB (bukan ID YouTube)
 * @param {String} actionType - 'DELETE' atau 'HOLD'
 */
const executeModerationAction = async (
  tokens,
  analysisId,
  commentIds,
  actionType,
  banAuthor = false,
) => {
  // 1. Validasi Action
  let youtubeStatus;
  if (actionType === 'DELETE') {
    youtubeStatus = 'rejected';
  } else if (actionType === 'HOLD') {
    youtubeStatus = 'heldForReview';
  } else {
    throw new AppError('Aksi tidak valid.', 400);
  }

  // 2. Ambil ID YouTube Asli
  const comments = await AnalyzedCommentRepository.find({
    _id: { $in: commentIds },
    analysisId: analysisId,
  }).select('youtubeCommentId');

  if (comments.length === 0) {
    throw new AppError('Komentar tidak ditemukan.', 404);
  }
  const youtubeIds = comments.map((c) => c.youtubeCommentId);

  console.log(
    `[Moderation] Action: ${actionType}, Ban Author: ${banAuthor}, Total: ${youtubeIds.length}`,
  );

  // 3. Panggil YouTube API (Pass parameter banAuthor)
  // Pastikan youtube.service.js Anda sudah menerima parameter ke-4 (banAuthor) sesuai kode sebelumnya
  const apiResult = await youtubeService.setModerationStatus(
    tokens,
    youtubeIds,
    youtubeStatus,
    banAuthor, // <--- KIRIM KE YOUTUBE
  );

  // 4. Update Status di MongoDB
  await AnalyzedCommentRepository.updateMany(
    { _id: { $in: commentIds } },
    {
      $set: {
        actionTaken: actionType,
        actionTakenAt: new Date(),
        authorBanned: banAuthor, // <--- CATAT DI DB
      },
    },
  );

  // 5. Update Statistik Header (Opsional, logika sama seperti sebelumnya)
  if (actionType === 'DELETE') {
    await VideoAnalysisRepository.findByIdAndUpdate(analysisId, {
      lastBatchDeletionAttemptAt: new Date(),
      $inc: {
        lastBatchDeletionSuccessCount: apiResult.successCount,
        lastBatchDeletionFailureCount: apiResult.failCount,
      },
      moderationStatus: 'PARTIAL',
    });
  }

  return {
    requested: comments.length,
    youtubeResult: apiResult,
  };
};

/**
 * Mengembalikan komentar yang dihapus/ditahan menjadi PUBLISHED (Undo).
 */
const executeUndoAction = async (tokens, analysisId, commentIds) => {
  // 1. Ambil ID YouTube Asli dari DB
  const comments = await AnalyzedCommentRepository.find({
    _id: { $in: commentIds },
    analysisId: analysisId,
  }).select('youtubeCommentId');

  if (comments.length === 0) {
    throw new AppError('Komentar tidak ditemukan.', 404);
  }
  const youtubeIds = comments.map((c) => c.youtubeCommentId);

  console.log(`[Undo] Restoring ${youtubeIds.length} comments to PUBLISHED...`);

  // 2. Panggil YouTube API -> Status 'published'
  // banAuthor: false (Kita tidak ingin nge-ban saat undo)
  const apiResult = await youtubeService.setModerationStatus(
    tokens,
    youtubeIds,
    'published',
    false,
  );

  console.log('DEBUG YOUTUBE RESPONSE:', JSON.stringify(apiResult, null, 2));

  // 3. Reset Status di MongoDB
  // Kita kembalikan actionTaken menjadi 'NONE' (atau bisa buat status baru 'RESTORED' jika ingin dicatat history-nya)
  // Saya sarankan 'RESTORED' agar kita tahu komentar ini bekas dihapus.
  await AnalyzedCommentRepository.updateMany(
    { _id: { $in: commentIds } },
    {
      $set: {
        actionTaken: 'NONE',
        actionTakenAt: new Date(),
      },
      // Note: Kita tidak mengubah authorBanned menjadi false disini,
      // karena API YouTube setModerationStatus tidak secara eksplisit 'Unban'.
      // Fitur Unban user butuh endpoint LiveChat/Settings yang berbeda.
      // Jadi fokus Undo ini adalah: MENGEMBALIKAN KOMENTAR.
    },
  );

  return {
    requested: comments.length,
    youtubeResult: apiResult,
  };
};

// ------END OF NEW LOGIC--------------------------------------------------

// ------- OLD LOGIC-------
/**
 * Memulai proses analisis HANYA untuk komentar tingkat atas (top-level comments)
 * dengan alur kerja yang dioptimalkan untuk performa.
 */
const startVideoAnalysis = async (userId, youtubeVideoUrl) => {
  const youtubeVideoId = getYouTubeVideoId(youtubeVideoUrl);
  if (!youtubeVideoId) {
    throw new BadRequestError('URL Video YouTube tidak valid.');
  }

  const youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);

  // Buat entri log analisis di database
  let analysisEntry = await VideoAnalysisRepository.create({
    userId,
    youtubeVideoId,
    status: 'PROCESSING',
    processingStartedAt: Date.now(),
    totalCommentsAnalyzed: 0,
  });

  try {
    const videoDetails = await youtubeService.getVideoDetails(youtubeVideoId, {
      youtubeClient,
    });
    if (videoDetails?.snippet) {
      analysisEntry.videoTitle = videoDetails.snippet.title;
    }

    // --- BAGIAN 2: AMBIL DATA KOMENTAR (Tidak berubah) ---
    const commentThreads = await youtubeService.fetchCommentsForVideo(
      youtubeVideoId,
      userId,
      { youtubeClient },
      100,
      config.MAX_TOP_LEVEL_COMMENTS || 200,
    );

    analysisEntry.totalCommentsFetched = commentThreads.length;

    if (commentThreads.length === 0) {
      console.log(
        `[VideoAnalysis-${analysisEntry._id}] Tidak ada komentar ditemukan. Analisis selesai.`,
      );
      analysisEntry.status = 'COMPLETED';
      analysisEntry.completedAt = Date.now();
      await analysisEntry.save();
      return analysisEntry.toObject();
    }

    // --- BAGIAN 3: PROSES DENGAN AI (Dengan Optimasi) ---
    const validComments = commentThreads
      .map((thread) => {
        const comment = thread?.snippet?.topLevelComment;
        // Validasi ketat struktur komentar
        if (!comment?.id || !comment.snippet || !comment.snippet.authorChannelId?.value) {
          console.warn('Struktur komentar tidak valid:', comment);
          return null;
        }
        return comment;
      })
      .filter(Boolean); // Hapus null/undefined

    const commentIdsFromYouTube = validComments.map((c) => {
      if (!c.id.startsWith('Ug')) {
        throw new Error(`Format YouTube Comment ID tidak valid: ${c.id}`);
      }
      return c.id;
    });
    const existingCommentIds = new Set(
      (
        await AnalyzedCommentRepository.find({
          youtubeCommentId: { $in: commentIdsFromYouTube },
        }).select('youtubeCommentId -_id')
      ).map((c) => c.youtubeCommentId),
    );
    const newCommentsToAnalyze = validComments.filter((c) => !existingCommentIds.has(c.id));

    if (newCommentsToAnalyze.length > 0) {
      console.log(`Memulai analisis untuk ${newCommentsToAnalyze.length} komentar baru`);

      const analysisPromises = newCommentsToAnalyze.map((comment) =>
        aiService.analyzeTextWithAI(comment.snippet.textOriginal),
      );
      const aiResults = await Promise.all(analysisPromises);

      const saveOperations = [];

      for (let i = 0; i < newCommentsToAnalyze.length; i++) {
        const comment = newCommentsToAnalyze[i];
        const aiResult = aiResults[i];

        // Pastikan semua field penting ada
        if (!comment.snippet.authorChannelId?.value) {
          console.error('Komentar tidak memiliki authorChannelId:', comment.id);
          continue;
        }

        const documentToSave = {
          analysisId: analysisEntry._id, // Tidak perlu new mongoose.Types.ObjectId
          userId: new mongoose.Types.ObjectId(userId),
          youtubeVideoId,
          youtubeCommentId: comment.id,
          authorChannelId: comment.snippet.authorChannelId.value,
          parentYoutubeCommentId: null,
          commentTextOriginal: comment.snippet.textOriginal,
          commentTextDisplay: comment.snippet.textDisplay,
          commentAuthorDisplayName: comment.snippet.authorDisplayName,
          commentAuthorProfileImageUrl: comment.snippet.authorProfileImageUrl,
          commentPublishedAt: new Date(comment.snippet.publishedAt),
          commentUpdatedAt: new Date(comment.snippet.updatedAt),
          likeCount: comment.snippet.likeCount || 0,
          classification: aiResult.classification,
          aiConfidenceScore: aiResult.confidenceScore,
          aiModelVersion: aiResult.modelVersion,
          metadata: {
            // Simpan data tambahan
            isReply: false,
            originalResponse: comment, // Simpan raw data untuk referensi
          },
        };

        saveOperations.push(
          AnalyzedCommentRepository.create(documentToSave)
            .then(() => 1)
            .catch((error) => {
              console.error(`Gagal menyimpan komentar ${comment.id}:`, error.message);
              return 0;
            }),
        );
      }

      const results = await Promise.all(saveOperations);
      const successfulSaves = results.reduce((sum, val) => sum + val, 0);

      console.log(`Berhasil menyimpan ${successfulSaves}/${newCommentsToAnalyze.length} komentar`);
      analysisEntry.totalCommentsAnalyzed = successfulSaves;
    }

    // --- BAGIAN 4: FINALISASI ---
    analysisEntry.status = 'COMPLETED';
    analysisEntry.completedAt = Date.now();

    // <<< PENYEMPURNAAN: Hanya satu kali 'save' di akhir blok try >>>
    await analysisEntry.save();

    console.log(
      `[VideoAnalysis-${analysisEntry._id}] Analisis selesai. Komentar baru yang dianalisis: ${analysisEntry.totalCommentsAnalyzed}.`,
    );

    return analysisEntry.toObject(); // Kembalikan POJO agar konsisten
  } catch (error) {
    // --- Error Handling ---
    // <<< PENYEMPURNAAN: Log seluruh objek error untuk stack trace >>>
    console.error(
      `[VideoAnalysis-${analysisEntry?._id}] Terjadi error besar selama proses:`,
      error,
    );

    if (analysisEntry) {
      // Pastikan analysisEntry ada sebelum mencoba save
      analysisEntry.status = 'FAILED';
      analysisEntry.errorMessage = error.message;
      await analysisEntry.save();
    }

    throw error;
  }
};

// /**
//  * Mengambil semua komentar dan balasan yang telah dianalisis untuk sebuah VideoAnalysisRepository.
//  * @param {string} videoAnalysisId - ID dari VideoAnalysisRepository.
//  * @param {string} userId - ID User Judi Guard yang memiliki analisis tersebut.
//  * @returns {Promise<Array<object>>} Array objek AnalyzedComment (POJO), diurutkan berdasarkan tanggal publikasi.
//  */
// const getAnalysisResults = async (videoAnalysisId, userId) => {
//   const videoAnalysis = await VideoAnalysisRepository.findOne({
//     _id: videoAnalysisId,
//     userId: userId,
//   });

//   if (!videoAnalysis) {
//     throw new NotFoundError(
//       "Data analisis video tidak ditemukan atau Anda tidak memiliki akses.",
//     );
//   }

//   // Mengambil semua komentar dan balasan yang terkait dengan videoAnalysisId ini
//   const analyzedComments = await AnalyzedCommentRepository.find({
//     analysisId: videoAnalysisId, // Pastikan field ini sesuai dengan yang disimpan
//   }).sort({ commentPublishedAt: 1 }); // Tambahkan pengurutan

//   return analyzedComments;
// };

/**
 * Memulai proses penghapusan semua komentar yang diklasifikasikan sebagai "judi"
 * untuk sebuah VideoAnalysis tertentu secara paralel.
 * @param {string} userId - ID User Judi Guard yang meminta.
 * @param {string} analysisId - ID dari VideoAnalysisRepository.
 * @returns {Promise<object>} Objek yang berisi ringkasan hasil operasi.
 */
const requestBatchDeleteJudiComments = async (userId, analysisId) => {
  // 1. Verifikasi bahwa VideoAnalysis ada dan milik user yang meminta
  const videoAnalysis = await VideoAnalysisRepository.findOne({
    _id: analysisId,
    userId: userId,
  });

  if (!videoAnalysis) {
    throw new NotFoundError('Data analisis video tidak ditemukan atau Anda tidak memiliki akses.');
  }

  // 2. Dapatkan YouTube client yang terautentikasi (hanya sekali di awal)
  let youtubeClient;
  try {
    youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);
  } catch (authError) {
    console.error(
      `[VideoAnalysis-${videoAnalysis}] Error autentikasi YouTube untuk batch delete:`,
      authError.message,
    );
    throw authError; // Teruskan error autentikasi
  }

  // 3. Ambil semua komentar yang akan dihapus
  const classificationForJudi = 'JUDI'; // Definisikan sebagai konstanta
  const commentsToBatchDelete = await AnalyzedCommentRepository.find({
    videoAnalysisId: videoAnalysis,
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
    `[VideoAnalysis-${videoAnalysis}] Memulai batch delete untuk ${commentsToBatchDelete.length} komentar '${classificationForJudi}'. User ID: ${userId}`,
  );

  // Update status VideoAnalysis untuk menandakan proses sedang berjalan
  videoAnalysis.status = 'DELETING_CLASSIFIED_COMMENTS';
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
      const errorMessage = error.message || 'Unknown error during deletion';
      console.error(
        `[VideoAnalysisService] Gagal menghapus komentar ${comment.youtubeCommentId} dari YouTube:`,
        errorMessage,
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
    if (result.status === 'fulfilled') {
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
    videoAnalysis.status = 'COMPLETED_DELETION_WITH_PARTIAL_ERRORS';
  } else if (failedToDeleteCount > 0 && successfullyDeletedCount === 0) {
    videoAnalysis.status = 'FAILED_ALL_DELETIONS';
  } else if (failedToDeleteCount === 0 && successfullyDeletedCount > 0) {
    videoAnalysis.status = 'COMPLETED_ALL_DELETIONS_SUCCESSFULLY';
  } else {
    // Jika tidak ada yang diproses (tidak seharusnya terjadi jika length > 0)
    videoAnalysis.status = 'COMPLETED'; // Kembali ke status umum
  }

  // Simpan statistik penghapusan ke dokumen analisis utama
  videoAnalysis.lastBatchDeletionSuccessCount = successfullyDeletedCount;
  videoAnalysis.lastBatchDeletionFailureCount = failedToDeleteCount;
  videoAnalysis.completedAt = Date.now(); // Atau gunakan field `lastBatchDeletionCompletedAt`
  await videoAnalysis.save();

  console.log(
    `[VideoAnalysis-${videoAnalysis}] Batch delete selesai. Berhasil: ${successfullyDeletedCount}, Gagal: ${failedToDeleteCount}.`,
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
 * Meminta penghapusan atau moderasi komentar YouTube berdasarkan kepemilikan.
 * @param {string} userId ID pengguna dari database lokal Anda.
 * @param {string} analyzedCommentId ID komentar dari database AnalysedComment Anda.
 * @param {string} youtubeCommentId ID komentar YouTube yang sebenarnya.
 * @returns {object} Objek komentar yang diperbarui dari database Anda.
 * @throws {Error} Error jika validasi gagal, komentar tidak ditemukan, atau ada masalah API.
 */
const requestDeleteYoutubeComment = async (userId, analyzedCommentId, youtubeCommentId) => {
  // 1. Validasi ID
  if (!mongoose.Types.ObjectId.isValid(analyzedCommentId)) {
    throw new BadRequestError('Invalid analyzed comment ID');
  }

  // YouTube comment IDs selalu dimulai dengan 'Ug'
  if (!youtubeCommentId?.startsWith('Ug')) {
    throw new BadRequestError('Invalid YouTube comment ID format');
  }

  // 2. Cari dan validasi komentar dari database Anda
  const comment = await AnalyzedCommentRepository.findOne({
    _id: analyzedCommentId,
    userId,
    youtubeCommentId,
  });

  if (!comment) {
    throw new NotFoundError('Comment not found or not owned by user in database');
  }

  // 3. Jika sudah ditandai sebagai terhapus/dimoderasi di database, kembalikan saja
  // Anda mungkin ingin mengganti 'isDeletedOnYoutube' dengan 'isRemovedFromYoutube'
  // atau menambahkan 'isModeratedOnYoutube' untuk kejelasan.
  if (comment.isDeletedOnYoutube || comment.isModeratedOnYoutube) {
    // Asumsi ada isModeratedOnYoutube
    console.log(
      `[VIDEO_ANALYSIS_SERVICE] Komentar ${youtubeCommentId} sudah ditandai dihapus/dimoderasi.`,
    );
    return comment.toObject();
  }

  const youtubeClient = await youtubeService.getAuthenticatedYouTubeClient(userId);

  let updatedComment;
  try {
    // 4. Dapatkan detail komentar dari YouTube untuk memeriksa kepemilikan secara real-time
    const youtubeCommentDetailsRes = await youtubeClient.comments
      .list({
        id: youtubeCommentId,
        part: 'snippet',
      })
      .execute();

    if (youtubeCommentDetailsRes.data.items.length === 0) {
      throw new NotFoundError('Komentar tidak ditemukan di YouTube.');
    }
    const actualYoutubeComment = youtubeCommentDetailsRes.data.items[0];
    const commentAuthorChannelId = actualYoutubeComment.snippet.authorChannelId?.value;

    const myChannelRes = await youtubeClient.channels
      .list({
        mine: true,
        part: 'id',
      })
      .execute();
    const authenticatedUserChannelId = myChannelRes.data.items[0]?.id;

    // 5. Tentukan apakah komentar dapat dihapus permanen atau hanya dimoderasi
    if (commentAuthorChannelId === authenticatedUserChannelId) {
      // Jika komentar dibuat oleh channel pengguna yang diautentikasi
      console.log(
        `[VIDEO_ANALYSIS_SERVICE] Komentar milik pengguna, mencoba penghapusan permanen: ${youtubeCommentId}`,
      );
      await youtubeService.deleteYoutubeComment(youtubeCommentId, {
        youtubeClient,
      });
      // Perbarui status database: berhasil dihapus permanen
      updatedComment = await AnalyzedCommentRepository.findByIdAndUpdate(
        analyzedCommentId,
        {
          isDeletedOnYoutube: true,
          isModeratedOnYoutube: false, // Jika dihapus permanen, tidak dimoderasi
          deletionAttemptedAt: new Date(),
          deletionError: null,
        },
        { new: true },
      );
    } else {
      // Jika komentar bukan milik pengguna yang diautentikasi, lakukan moderasi (sembunyikan sebagai spam)
      console.log(
        `[VIDEO_ANALYSIS_SERVICE] Komentar bukan milik pengguna, mencoba moderasi (likelySpam): ${youtubeCommentId}`,
      );
      await youtubeService.moderateYoutubeComment(youtubeCommentId, 'likelySpam', {
        youtubeClient,
      });
      // Perbarui status database: berhasil dimoderasi/disembunyikan
      updatedComment = await AnalyzedCommentRepository.findByIdAndUpdate(
        analyzedCommentId,
        {
          isDeletedOnYoutube: false, // Tidak dihapus permanen
          isModeratedOnYoutube: true, // Berhasil disembunyikan via moderasi
          deletionAttemptedAt: new Date(),
          deletionError: null,
        },
        { new: true },
      );
    }

    return updatedComment.toObject();
  } catch (error) {
    console.error(
      `[VIDEO_ANALYSIS_SERVICE] Error saat memproses komentar ${youtubeCommentId}:`,
      error,
    );

    // Perbarui database dengan status error
    await AnalyzedCommentRepository.findByIdAndUpdate(analyzedCommentId, {
      isDeletedOnYoutube: false,
      isModeratedOnYoutube: false, // Reset status jika ada error
      deletionAttemptedAt: new Date(),
      deletionError: error.message,
    });

    // Lempar kembali error dengan mapping yang sesuai
    if (error.code === 400 || error instanceof BadRequestError) {
      throw new BadRequestError(error.message, error.details);
    }
    if (error.code === 404 || error instanceof NotFoundError) {
      throw new NotFoundError(error.message, error.details);
    }
    if (error.code === 403) {
      // Penanganan spesifik untuk kasus tidak bisa menghapus permanen
      if (error.message.includes('NOT_COMMENT_OWNER_CANNOT_DELETE_PERMANENtLY')) {
        throw new ForbiddenError(
          'Komentar ini bukan milik Anda. Komentar akan disembunyikan sebagai spam di video Anda, bukan dihapus permanen. Silakan periksa panel moderasi YouTube Anda.',
          error.details,
        );
      }
      if (error.message.includes('NOT_CHANNEL_OWNER_OF_VIDEO_FOR_MODERATION')) {
        throw new ForbiddenError(
          'Anda tidak memiliki izin untuk memoderasi komentar di video ini. Pastikan Anda adalah pemilik video.',
          error.details,
        );
      }
      throw new ForbiddenError(error.message, error.details);
    }
    throw error; // Lempar error lainnya
  }
  // Hapus baris `finally { next(error); }`
};

export {
  createAnalysisRecord,
  processAnalysis,
  updateAnalysisStatus,
  getAnalysisResults,
  executeModerationAction,
  executeUndoAction,
  startVideoAnalysis,
  requestBatchDeleteJudiComments,
  requestDeleteYoutubeComment,
};
