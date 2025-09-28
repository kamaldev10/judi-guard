// src/api/services/youtube.service.js
const { google } = require("googleapis");
const User = require("../models/User.model"); // Untuk mengambil token user
const { createOAuth2Client } = require("../../utils/googleOAuth2Client"); // Utilitas OAuth2 client kita
const {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../../utils/errors"); // Utilitas error
const config = require("../../config/environment"); // Konfigurasi environment
const YOUTUBE_SCOPE = [
  // Perbaiki nama variabel jika ini khusus untuk YouTube
  // "https://www.googleapis.com/auth/userinfo.profile",
  // "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  // "https://www.googleapis.com/auth/youtube.readonly", // Alternatif jika hanya perlu baca
  // "https://www.googleapis.com/auth/youtube", // Akses lebih luas jika diperlukan (misal, hapus komentar)
];
// Tambahkan mutex untuk prevent race condition
const tokenMutex = new Map();

/**
 * Mendapatkan YouTube API client yang sudah terautentikasi untuk pengguna.
 * Akan mencoba me-refresh access token jika sudah kedaluwarsa atau hampir kedaluwarsa.
 * @param {string} userId - ID dari User Judi Guard.
 * @returns {Promise<google.youtube_v3.Youtube>} Instance client YouTube API yang terautentikasi.
 * @throws {UnauthorizedError} Jika pengguna belum menghubungkan akun YouTube atau refresh token gagal.
 */
const getAuthenticatedYouTubeClient = async (userId) => {
  const user = await User.findById(userId).select(
    "+youtubeAccessToken +youtubeRefreshToken +youtubeTokenExpiresAt"
  );

  if (!user || !user.youtubeAccessToken) {
    throw new UnauthorizedError(
      "Pengguna belum menghubungkan akun YouTube atau token akses tidak ditemukan. Silakan hubungkan akun YouTube Anda melalui profil."
    );
  }

  const oAuth2Client = createOAuth2Client();
  oAuth2Client.setCredentials({
    scope: YOUTUBE_SCOPE.join(" "),
    access_token: user.youtubeAccessToken,
    refresh_token: user.youtubeRefreshToken,
    expiry_date: user.youtubeTokenExpiresAt
      ? user.youtubeTokenExpiresAt.getTime()
      : null,
  });

  // Cek apakah token perlu di-refresh (misalnya, jika kurang dari 5 menit lagi akan kedaluwarsa)
  // Library googleapis biasanya akan mencoba refresh otomatis jika 'expiry_date' sudah lewat saat request dibuat,
  // asalkan refresh_token ada. Namun, kita bisa proaktif.
  const fiveMinutesInMs = 5 * 60 * 1000;
  const needsRefresh =
    user.youtubeTokenExpiresAt &&
    user.youtubeTokenExpiresAt.getTime() < Date.now() + fiveMinutesInMs;

  if (needsRefresh) {
    if (!tokenMutex.has(userId)) {
      tokenMutex.set(
        userId,
        new Promise(async (resolve, reject) => {
          try {
            const { credentials } = await oAuth2Client.refreshAccessToken();
            // Update user dan credentials
            console.info(credentials.scope);
            resolve(credentials);
          } catch (error) {
            reject(error);
          } finally {
            tokenMutex.delete(userId);
          }
        })
      );
    }

    try {
      console.log(
        `[YouTubeService] Refreshing YouTube access token for user ${userId}...`
      );
      // Minta token baru menggunakan refresh token
      const credentials = await tokenMutex.get(userId);
      oAuth2Client.setCredentials(credentials);
      console.log(credentials.scope);
      // Update token di database user
      user.youtubeAccessToken = credentials.access_token;
      // Google mungkin atau mungkin tidak mengirim refresh_token baru saat refresh.
      // Jika ada, update. Jika tidak, refresh token lama tetap valid.
      if (credentials.refresh_token) {
        user.youtubeRefreshToken = credentials.refresh_token;
      }
      user.youtubeTokenExpiresAt = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : null;
      await user.save();
      console.log(
        `[YouTubeService] YouTube access token refreshed for user ${userId}. New expiry: ${user.youtubeTokenExpiresAt}`
      );
    } catch (refreshError) {
      console.error(
        `[YouTubeService] Gagal me-refresh YouTube access token untuk user ${userId}:`,
        refreshError.response
          ? refreshError.response.data
          : refreshError.message
      );
      // Jika refresh token gagal (misalnya, akses dicabut oleh pengguna di Google),
      // kita harus menghapus token yang tidak valid dan meminta pengguna untuk re-autentikasi.
      user.youtubeAccessToken = undefined;
      user.youtubeRefreshToken = undefined;
      user.youtubeTokenExpiresAt = undefined;
      await user.save();
      throw new UnauthorizedError(
        "Gagal memperbarui sesi YouTube Anda. Kemungkinan akses telah dicabut. Silakan hubungkan kembali akun YouTube Anda."
      );
    }
  }

  const info = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token
  );
  console.log(info.scopes);

  return google.youtube({ version: "v3", auth: oAuth2Client });
};

/**
 * Mengambil detail sebuah video YouTube.
 * @param {string} videoId - ID Video YouTube.
 * @param {object} options
 * @param {google.youtube_v3.Youtube} [options.youtubeClient] - Opsional, client YouTube yang sudah terautentikasi. Jika tidak ada, akan menggunakan apiKey.
 * @param {string} [options.apiKey] - Opsional, API Key jika tidak menggunakan client terautentikasi (untuk data publik).
 * @returns {Promise<object|null>} Objek detail video atau null jika tidak ditemukan.
 * @throws {AppError} Jika terjadi error saat mengambil data atau kuota habis.
 * @throws {NotFoundError} Jika video tidak ditemukan.
 */
const getVideoDetails = async (videoId, { youtubeClient, apiKey }) => {
  let authClient = youtubeClient; // Prioritaskan client yang sudah terautentikasi

  if (!authClient) {
    if (apiKey) {
      // Buat client sementara dengan API Key (hanya untuk data publik, tidak terautentikasi sebagai user)
      authClient = google.youtube({ version: "v3", auth: apiKey });
      console.log(
        `[YouTubeService] Mengambil detail video ${videoId} menggunakan API Key.`
      );
    } else {
      throw new AppError(
        "Diperlukan youtubeClient (terautentikasi) atau apiKey untuk mengambil detail video.",
        500
      );
    }
  } else {
    console.log(
      `[YouTubeService] Mengambil detail video ${videoId} menggunakan client terautentikasi.`
    );
  }

  try {
    const response = await authClient.videos.list({
      part: "snippet,contentDetails,statistics", // Ambil snippet (title, description), contentDetails (duration), statistics (viewCount, likeCount)
      id: videoId,
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    }
    // Jika items kosong, berarti video tidak ditemukan atau tidak dapat diakses
    throw new NotFoundError(
      `Video dengan ID ${videoId} tidak ditemukan atau tidak dapat diakses.`
    );
  } catch (error) {
    console.error(
      `[YouTubeService] Error mengambil detail video ${videoId}:`,
      error.response ? error.response.data : error.message
    );
    if (error instanceof NotFoundError) throw error; // Teruskan error NotFoundError

    if (
      error.code === 403 &&
      error.message &&
      error.message.includes("quotaExceeded")
    ) {
      throw new AppError(
        "Kuota YouTube API telah terlampaui. Silahkan coba lagi esok hari",
        429
      ); // Too Many Requests
    }

    if (error.code === 404) {
      // Error dari Google API juga bisa 404
      throw new NotFoundError(
        `Video dengan ID ${videoId} tidak ditemukan (API Error).`
      );
    }
    throw new AppError(
      `Gagal mengambil detail video: ${error.message}`,
      error.code && typeof error.code === "number" ? error.code : 500
    );
  }
};

const fetchCommentsForVideo = async (
  videoId,
  userId,
  { youtubeClient },
  maxResultsPerPage = 100,
  limitTotalResults = 1000
) => {
  if (!youtubeClient) {
    throw new AppError(
      "Diperlukan youtubeClient yang terautentikasi untuk mengambil komentar.",
      500
    );
  }

  let allCommentThreads = []; // Akan menyimpan objek CommentThread utuh
  let nextPageToken = null;
  let fetchedCount = 0;
  const actualMaxPerPage = Math.min(maxResultsPerPage, 100);

  console.log(
    `[YouTubeService] Mulai mengambil komentar (threads) untuk video ID: ${videoId}. UserID: ${userId}. Target: ${limitTotalResults} komentar.`
  );

  try {
    do {
      const resultsToFetchThisPage = Math.min(
        actualMaxPerPage,
        limitTotalResults - fetchedCount
      );
      if (resultsToFetchThisPage <= 0) break;

      console.log(
        `[YouTubeService] Mengambil halaman commentThreads... PageToken: ${nextPageToken}, MaxResults: ${resultsToFetchThisPage}`
      );
      const response = await youtubeClient.commentThreads.list({
        part: "snippet,replies", // Meminta snippet dan replies
        videoId: videoId,
        maxResults: resultsToFetchThisPage,
        pageToken: nextPageToken,
        textFormat: "plainText",
        order: "time", // Diubah ke 'time' untuk potensi hasil yang lebih lengkap/konsisten
      });

      if (response.data.items && response.data.items.length > 0) {
        response.data.items.forEach((threadItem) => {
          // Validasi dasar untuk CommentThread dan topLevelComment
          if (
            threadItem &&
            threadItem.snippet &&
            threadItem.snippet.topLevelComment &&
            threadItem.snippet.topLevelComment.id &&
            threadItem.snippet.topLevelComment.snippet
          ) {
            // Memproses balasan yang mungkin sudah ada di threadItem.replies.comments
            const initialReplies = [];
            if (threadItem.replies && threadItem.replies.comments) {
              threadItem.replies.comments = threadItem.replies.comments.filter(
                (reply) => reply && reply.id && reply.snippet
              );

              threadItem.replies.comments.forEach((replyComment) => {
                // Validasi dasar untuk balasan
                if (replyComment && replyComment.id && replyComment.snippet) {
                  initialReplies.push({
                    // Simpan hanya data yang relevan dari balasan
                    id: replyComment.id,
                    textDisplay: replyComment.snippet.textDisplay,
                    authorDisplayName: replyComment.snippet.authorDisplayName,
                    publishedAt: replyComment.snippet.publishedAt,
                    likeCount: replyComment.snippet.likeCount,
                    parentId: replyComment.snippet.parentId, // Seharusnya ID dari topLevelComment
                    // ... field lain yang mungkin Anda butuhkan dari snippet balasan
                  });
                }
              });
            }

            // Menambahkan struktur yang dimodifikasi ke hasil
            // Anda bisa memilih untuk menyimpan threadItem utuh, atau memformatnya di sini.
            // Untuk konsistensi dengan cara Anda memproses komentar, mungkin lebih baik
            // service videoAnalysis.service.js yang mengekstrak topLevelComment dan initialReplies ini.
            // Untuk saat ini, kita simpan threadItem utuh, service lain yang akan memproses.
            allCommentThreads.push(threadItem); // Menyimpan objek CommentThread utuh
            fetchedCount++;
          } else {
            console.warn(
              `[YouTubeService] Item commentThread tidak memiliki struktur yang diharapkan, dilewati:`,
              JSON.stringify(threadItem, null, 2)
            );
          }
        });
      }

      nextPageToken = response.data.nextPageToken;
      console.log(
        `[YouTubeService] Fetched ${fetchedCount} comment threads so far for video ${videoId}. Next page: ${!!nextPageToken}`
      );
    } while (nextPageToken && fetchedCount < limitTotalResults);

    console.log(
      `[YouTubeService] Total ${allCommentThreads.length} comment threads diambil untuk video ID: ${videoId}`
    );
    return allCommentThreads; // Mengembalikan array objek CommentThread utuh
  } catch (error) {
    // Cek terlebih dahulu apakah ini error karena kuota habis.
    const isQuotaError =
      error.response?.data?.error?.errors?.[0]?.reason === "quotaExceeded" ||
      error.message?.toLowerCase().includes("quotaexceeded");

    if (isQuotaError) {
      // Log error di backend
      console.error(
        `[YouTubeService] QUOTA EXCEEDED saat mencoba mengakses resource untuk video ${videoId}. UserID: ${userId}.`
      );

      // --- PERBAIKAN: Gunakan error class yang spesifik ---
      throw new QuotaExceededError(
        "Kuota harian YouTube API telah habis. Silakan coba lagi besok."
      );
    }

    // ... (blok catch error Anda yang sudah baik tetap di sini) ...
    console.error(
      `[YouTubeService] Error mengambil commentThreads untuk video ${videoId} (UserID: ${userId}):`,
      error.response ? error.response.data : error.message
    );

    const googleApiErrorMessage =
      error.errors && error.errors[0] ? error.errors[0].message : error.message;
    if (error.code === 403) {
      console.error(
        `[YouTubeService] Error 403 (Forbidden) saat mengambil commentThreads untuk video ${videoId}. UserID: ${userId}. Detail Error Google:`,
        JSON.stringify(
          error.errors ||
            error.response?.data?.error || {
              message: googleApiErrorMessage,
              code: error.code,
            },
          null,
          2
        )
      );

      if (
        googleApiErrorMessage &&
        googleApiErrorMessage.toLowerCase().includes("commentsdisabled")
      ) {
        throw new AppError("Komentar dinonaktifkan untuk video ini.", 403);
      }
      if (
        googleApiErrorMessage &&
        googleApiErrorMessage.toLowerCase().includes("quotaexceeded")
      ) {
        throw new AppError("Kuota YouTube API telah terlampaui.", 429);
      }
      throw new AppError(
        `Akses ditolak untuk mengambil komentar: ${googleApiErrorMessage}`,
        403
      );
    }
    // ... sisa penanganan error ...
    throw new AppError(
      `Gagal mengambil komentar: ${googleApiErrorMessage}`,
      error.code && typeof error.code === "number" ? error.code : 500
    );
  }
};

// const deleteYoutubeComment = async (youtubeCommentId, { youtubeClient }) => {
//   try {
//     // 1. Verifikasi komentar ada
//     const commentRes = await youtubeClient.comments.list({
//       id: youtubeCommentId,
//       part: "snippet,id",
//     });

//     if (commentRes.data.items.length === 0) {
//       throw { code: 404, message: "COMMENT_NOT_FOUND" };
//     }

//     // 2. Verifikasi kepemilikan
//     const myChannel = await youtubeClient.channels.list({
//       mine: true,
//       part: "id",
//     });

//     const comment = commentRes.data.items[0];
//     if (comment.snippet.authorChannelId.value !== myChannel.data.items[0].id) {
//       throw {
//         code: 403,
//         message: "NOT_COMMENT_OWNER",
//         details: {
//           yourChannelId: myChannel.data.items[0].id,
//           commentAuthorId: comment.snippet.authorChannelId.value,
//         },
//       };
//     }
//     console.log(
//       "[YOTUBE_SERVICE]Channel ID yang terautentikasi:",
//       myChannel.data.items[0].id
//     );
//     console.log(
//       "[YOTUBE_SERVICE]Pemilik komentar:",
//       comment.snippet.authorChannelId.value
//     );
//     // 3. Eksekusi penghapusan
//     const deleteRes = await youtubeClient.comments.delete({
//       id: youtubeCommentId,
//     });
//     return deleteRes.data;
//   } catch (error) {
//     console.error("YouTube API Error:", {
//       youtubeCommentId,
//       error: error.message,
//       details: error.details || error.response?.data,
//     });
//     throw error;
//   }
// };

/**
 * Menghapus komentar YouTube secara permanen.
 * HANYA BISA MENGHAPUS KOMENTAR YANG DIPOSTING OLEH PENGGUNA YANG DIAUTENTIKASI.
 * Untuk komentar orang lain di video Anda, gunakan `moderateYoutubeComment`.
 * @param {string} youtubeCommentId ID komentar YouTube yang akan dihapus.
 * @param {object} options Opsi yang berisi klien YouTube yang diautentikasi.
 * @param {object} options.youtubeClient Klien YouTube yang diautentikasi.
 * @returns {object} Data respons dari API YouTube (biasanya kosong untuk delete).
 * @throws {object} Error jika komentar tidak ditemukan, bukan milik pengguna, atau ada masalah API.
 */
const deleteYoutubeComment = async (youtubeCommentId, { youtubeClient }) => {
  try {
    // 1. Verifikasi komentar ada dan ambil detailnya
    const commentRes = await youtubeClient.comments.list({
      id: youtubeCommentId,
      part: "snippet", // 'snippet' cukup untuk mendapatkan authorChannelId
    });

    if (commentRes.data.items.length === 0) {
      throw { code: 404, message: "COMMENT_NOT_FOUND_ON_YOUTUBE" };
    }

    const comment = commentRes.data.items[0];
    const commentAuthorChannelId = comment.snippet.authorChannelId?.value;

    // 2. Dapatkan ID saluran pengguna yang diautentikasi
    const myChannel = await youtubeClient.channels.list({
      mine: true,
      part: "id",
    });

    const authenticatedUserChannelId = myChannel.data.items[0]?.id;

    // 3. Verifikasi kepemilikan - HANYA PEMILIK KOMENTAR YANG BISA MENGHAPUS PERMANEN
    if (
      !authenticatedUserChannelId ||
      commentAuthorChannelId !== authenticatedUserChannelId
    ) {
      // Melempar error spesifik agar layer service bisa memutuskan untuk memoderasi
      throw {
        code: 403,
        message: "NOT_COMMENT_OWNER_CANNOT_DELETE_PERMANENTLY",
        details: {
          yourChannelId: authenticatedUserChannelId,
          commentAuthorId: commentAuthorChannelId,
        },
      };
    }

    // 4. Jika komentar ini memang milik pengguna yang diautentikasi, lanjutkan penghapusan permanen.
    const deleteRes = await youtubeClient.comments.delete({
      id: youtubeCommentId,
    });
    console.log(
      `[YOUTUBE_SERVICE] Komentar ${youtubeCommentId} berhasil dihapus permanen oleh pemilik.`
    );
    return deleteRes.data; // Biasanya kosong untuk delete yang berhasil
  } catch (error) {
    console.error("YouTube API Error (deleteYoutubeComment):", {
      youtubeCommentId,
      error: error.message,
      details: error.details || error.response?.data,
    });
    throw error;
  }
};

/**
 * Memoderasi (menyembunyikan/menandai) komentar YouTube.
 * Digunakan oleh pemilik saluran untuk mengelola komentar di video mereka yang diposting orang lain.
 * @param {string} youtubeCommentId ID komentar YouTube (ID thread komentar tingkat atas).
 * @param {string} moderationStatus Status moderasi yang diinginkan ('heldForReview', 'likelySpam', 'published').
 * @param {object} options Opsi yang berisi klien YouTube yang diautentikasi.
 * @param {object} options.youtubeClient Klien YouTube yang diautentikasi.
 * @returns {object} Data respons dari API YouTube setelah update.
 * @throws {object} Error jika komentar tidak ditemukan atau ada masalah API.
 */
const moderateYoutubeComment = async (
  youtubeCommentId,
  moderationStatus,
  { youtubeClient }
) => {
  try {
    // Untuk memoderasi komentar, kita perlu mengambil 'commentThread'
    // karena 'moderationStatus' adalah bagian dari thread, bukan komentar tunggal.
    // Kita juga perlu 'snippet.topLevelComment.snippet.textOriginal' untuk update.
    const commentThreadRes = await youtubeClient.commentThreads.list({
      id: youtubeCommentId, // Untuk komentar tingkat atas, ini adalah ID CommentThread
      part: "snippet", // Perlu snippet untuk mendapatkan detail komentar
    });

    if (commentThreadRes.data.items.length === 0) {
      throw { code: 404, message: "COMMENT_THREAD_NOT_FOUND" };
    }

    const commentThread = commentThreadRes.data.items[0];
    const topLevelComment = commentThread.snippet.topLevelComment;

    // Pastikan ini adalah komentar di video milik channel yang diautentikasi.
    // Jika tidak, API akan menolak karena izin.
    const myChannel = await youtubeClient.channels.list({
      mine: true,
      part: "id",
    });
    const authenticatedUserChannelId = myChannel.data.items[0]?.id;

    // Asumsi commentThread.snippet.channelId adalah ID channel pemilik video.
    // YouTube API `commentThreads.update` hanya bisa memoderasi komentar
    // di video yang dimiliki oleh channel yang diautentikasi.
    if (
      !authenticatedUserChannelId ||
      commentThread.snippet.channelId !== authenticatedUserChannelId
    ) {
      throw {
        code: 403,
        message: "NOT_CHANNEL_OWNER_OF_VIDEO_FOR_MODERATION",
        details: {
          yourChannelId: authenticatedUserChannelId,
          videoOwnerChannelId: commentThread.snippet.channelId,
        },
      };
    }

    // Buat snippet baru dengan status moderasi yang diinginkan
    // Penting: Anda harus menyertakan semua bagian snippet yang diperlukan API,
    // termasuk `textOriginal`.
    const updatedSnippet = {
      ...topLevelComment.snippet, // Salin snippet yang sudah ada
      moderationStatus: moderationStatus, // Atur status moderasi
    };

    const updateRes = await youtubeClient.commentThreads.update({
      part: "snippet",
      resource: {
        id: youtubeCommentId, // ID thread komentar yang akan diupdate
        snippet: {
          videoId: commentThread.snippet.videoId, // ID video yang terkait
          topLevelComment: updatedSnippet,
        },
      },
    });
    console.log(
      `[YOUTUBE_SERVICE] Komentar ${youtubeCommentId} dimoderasi ke status: ${moderationStatus}`
    );
    return updateRes.data;
  } catch (error) {
    console.error("YouTube API Error (moderateYoutubeComment):", {
      youtubeCommentId,
      moderationStatus,
      error: error.message,
      details: error.details || error.response?.data,
    });
    throw error;
  }
};

module.exports = {
  getAuthenticatedYouTubeClient,
  getVideoDetails,
  fetchCommentsForVideo,
  deleteYoutubeComment,
  moderateYoutubeComment,
};
