//* src/api/services/youtube.service.js
const { google } = require("googleapis");
const User = require("../models/User.model");
const googleOAuth2Client = require("../../utils/googleOAuth2Client");
const {
  AppError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../../utils/errors");
const config = require("../../config/environment");
const YOUTUBE_SCOPE = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/youtube.force-ssl",
  // "https://www.googleapis.com/auth/youtube.readonly", // Alternatif jika hanya perlu baca
  "https://www.googleapis.com/auth/youtube",
];
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
    "+youtubeAccessToken +youtubeRefreshToken +youtubeTokenExpiresAt",
  );

  if (!user || !user.youtubeAccessToken) {
    throw new UnauthorizedError(
      "Pengguna belum menghubungkan akun YouTube atau token akses tidak ditemukan. Silakan hubungkan akun YouTube Anda melalui profil.",
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
            console.info(credentials.scope);
            resolve(credentials);
          } catch (error) {
            reject(error);
          } finally {
            tokenMutex.delete(userId);
          }
        }),
      );
    }

    try {
      console.log(
        `[YouTubeService] Refreshing YouTube access token for user ${userId}...`,
      );
      const credentials = await tokenMutex.get(userId);
      oAuth2Client.setCredentials(credentials);
      console.log(credentials.scope);
      user.youtubeAccessToken = credentials.access_token;
      if (credentials.refresh_token) {
        user.youtubeRefreshToken = credentials.refresh_token;
      }
      user.youtubeTokenExpiresAt = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : null;
      await user.save();
      console.log(
        `[YouTubeService] YouTube access token refreshed for user ${userId}. New expiry: ${user.youtubeTokenExpiresAt}`,
      );
    } catch (refreshError) {
      console.error(
        `[YouTubeService] Gagal me-refresh YouTube access token untuk user ${userId}:`,
        refreshError.response
          ? refreshError.response.data
          : refreshError.message,
      );
      user.youtubeAccessToken = undefined;
      user.youtubeRefreshToken = undefined;
      user.youtubeTokenExpiresAt = undefined;
      await user.save();
      throw new UnauthorizedError(
        "Gagal memperbarui sesi YouTube Anda. Kemungkinan akses telah dicabut. Silakan hubungkan kembali akun YouTube Anda.",
      );
    }
  }

  const info = await oAuth2Client.getTokenInfo(
    oAuth2Client.credentials.access_token,
  );
  console.log(info.scopes);

  return google.youtube({ version: "v3", auth: oAuth2Client });
};

/**
 * Helper Private: Membuat Instance Google Client yang Terautentikasi.
 * Penting: Kita membuat instance baru setiap kali fungsi dipanggil (Thread-Safe),
 * alih-alih menggunakan instance global yang bisa menyebabkan konflik token antar user.
 */
const getClient = (tokens) => {
  const client = new google.auth.OAuth2(
    config.youtube.clientId,
    config.youtube.clientSecret,
    config.youtube.guestRedirectUri,
  );

  // Set credentials yang didapat dari Hybrid Auth (Cookie/DB)
  client.setCredentials(tokens);

  return google.youtube({ version: "v3", auth: client });
};

/**
 * Helper: Ambil Identitas Channel (ID, Nama, Foto)
 * Dipanggil CUMA SEKALI saat login/callback untuk disimpan di session.
 */
const getChannelIdentity = async (tokens) => {
  try {
    const youtube = getClient(tokens);

    // Ambil snippet (Nama, Foto) dan ID
    const response = await youtube.channels.list({
      part: "snippet,id",
      mine: true,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new AppError("Channel YouTube tidak ditemukan.", 404);
    }

    const item = response.data.items[0];

    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default?.url,
      customUrl: item.snippet.customUrl,
    };
  } catch (error) {
    console.error("[YouTube Service] Error getting identity:", error.message);
    throw new AppError("Gagal mengambil identitas channel.", 500);
  }
};

/**
 * Mengambil Daftar Video Channel + Statistik (View, Like, Comment Count)
 * Cost: 3 Unit per 50 Video (Sangat Hemat)
 */
const getChannelVideos = async (tokens, pageToken = "") => {
  try {
    const youtube = getClient(tokens);

    // 1. Dapatkan ID Playlist "Uploads"
    // Cost: 1 Unit
    const channelRes = await youtube.channels.list({
      part: "contentDetails",
      mine: true,
    });

    if (!channelRes.data.items?.length) {
      throw new AppError("Channel YouTube tidak ditemukan.", 404);
    }

    const uploadsPlaylistId =
      channelRes.data.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Ambil ID video dari playlist (Max 50)
    // Cost: 1 Unit
    const playlistRes = await youtube.playlistItems.list({
      part: "contentDetails", // Kita cuma butuh ID di sini
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken: pageToken,
    });

    const videoItems = playlistRes.data.items;

    if (!videoItems || videoItems.length === 0) {
      return {
        videos: [],
        nextPageToken: null,
        totalResults: 0,
      };
    }

    // Ekstrak semua Video ID menjadi string koma (id1,id2,id3...)
    const videoIds = videoItems
      .map((item) => item.contentDetails.videoId)
      .join(",");

    // 3. Ambil Detail Statistik untuk 50 video tersebut sekaligus
    // Cost: 1 Unit
    const videosRes = await youtube.videos.list({
      part: "snippet,statistics", // Ambil Snippet (Judul/Gbr) + Statistics (Angka)
      id: videoIds,
    });

    // 4. Transformasi Data Lengkap
    const videos = videosRes.data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      statistics: {
        viewCount: item.statistics.viewCount || "0",
        likeCount: item.statistics.likeCount || "0",
        commentCount: item.statistics.commentCount || "0",
      },
    }));

    return {
      videos,
      nextPageToken: playlistRes.data.nextPageToken,
      totalResults: playlistRes.data.pageInfo.totalResults,
    };
  } catch (error) {
    console.error("[YouTube Service] Error fetching videos:", error.message);
    if (error.code === 401 || error.message.includes("invalid_grant")) {
      throw new AppError(
        "Sesi YouTube kadaluarsa. Silakan hubungkan ulang.",
        401,
      );
    }
    throw new AppError(`Gagal mengambil video: ${error.message}`, 502);
  }
};

/**
 * Mengambil Komentar (Threads & Replies) dari Video Tertentu.
 * * @param {Object} tokens - Token akses OAuth2
 * @param {String} videoId - ID Video YouTube
 * @param {String} pageToken - Token halaman
 */
const getVideoComments = async (tokens, videoId, pageToken = "") => {
  try {
    const youtube = getClient(tokens);

    // Cost: 1 Unit
    const response = await youtube.commentThreads.list({
      part: "snippet,replies",
      videoId: videoId,
      maxResults: 50, // Batch maksimal
      textFormat: "plainText",
      pageToken: pageToken,
      order: "relevance",
    });

    // Transformasi Data
    const comments = response.data.items.map((item) => {
      const topComment = item.snippet.topLevelComment.snippet;
      const topId = item.snippet.topLevelComment.id;

      return {
        threadId: item.id,
        videoId: item.snippet.videoId,
        totalReplyCount: item.snippet.totalReplyCount,
        isPublic: item.snippet.isPublic,

        // Komentar Induk (Top Level)
        topLevelComment: {
          id: topId,
          text: topComment.textDisplay,
          author: {
            name: topComment.authorDisplayName,
            avatar: topComment.authorProfileImageUrl,
            channelId: topComment.authorChannelId?.value,
          },
          likeCount: topComment.likeCount,
          publishedAt: topComment.publishedAt,
          updatedAt: topComment.updatedAt,
        },

        // Balasan (Replies) - YouTube otomatis menyertakan beberapa reply teratas
        replies:
          item.replies?.comments?.map((reply) => ({
            id: reply.id,
            text: reply.snippet.textDisplay,
            author: {
              name: reply.snippet.authorDisplayName,
              avatar: reply.snippet.authorProfileImageUrl,
              channelId: reply.snippet.authorChannelId?.value,
            },
            likeCount: reply.snippet.likeCount,
            publishedAt: reply.snippet.publishedAt,
          })) || [],
      };
    });

    return {
      comments,
      nextPageToken: response.data.nextPageToken,
    };
  } catch (error) {
    console.error("[YouTube Service] Error fetching comments:", error.message);
    if (error.code === 403) {
      throw new AppError(
        "Komentar dinonaktifkan pada video ini atau kuota habis.",
        403,
      );
    }
    throw new AppError(`Gagal mengambil komentar: ${error.message}`, 502);
  }
};

/**
 * Mengambil SELURUH Komentar (Looping sampai habis).
 * Digunakan untuk proses Analisis (Background Process).
 */
const getAllComments = async (tokens, videoId) => {
  try {
    const youtube = getClient(tokens);
    let allComments = [];
    let nextPageToken = null;
    let hasNextPage = true;

    // Loop terus selama masih ada halaman berikutnya (nextPageToken)
    while (hasNextPage) {
      // Cost: 1 Unit per request (per 100 komentar)
      const response = await youtube.commentThreads.list({
        part: "snippet,replies",
        videoId: videoId,
        maxResults: 100, // Kita maksimalkan ke 100 agar hemat request loop
        textFormat: "plainText",
        pageToken: nextPageToken || undefined,
        order: "relevance",
      });

      const items = response.data.items || [];

      // Transformasi Data
      const batchComments = items.map((item) => {
        const topComment = item.snippet.topLevelComment.snippet;
        const topId = item.snippet.topLevelComment.id;

        return {
          threadId: item.id,
          videoId: item.snippet.videoId,
          totalReplyCount: item.snippet.totalReplyCount,
          isPublic: item.snippet.isPublic,

          // Komentar Induk (Top Level)
          topLevelComment: {
            id: topId,
            text: topComment.textDisplay,
            author: {
              name: topComment.authorDisplayName,
              avatar: topComment.authorProfileImageUrl,
              channelId: topComment.authorChannelId?.value,
            },
            likeCount: topComment.likeCount,
            publishedAt: topComment.publishedAt,
            updatedAt: topComment.updatedAt,
          },

          // Balasan (Replies)
          replies:
            item.replies?.comments?.map((reply) => ({
              id: reply.id,
              text: reply.snippet.textDisplay,
              author: {
                name: reply.snippet.authorDisplayName,
                avatar: reply.snippet.authorProfileImageUrl,
                channelId: reply.snippet.authorChannelId?.value,
              },
              likeCount: reply.snippet.likeCount,
              publishedAt: reply.snippet.publishedAt,
            })) || [],
        };
      });

      // Gabungkan hasil batch ini ke array utama
      allComments = [...allComments, ...batchComments];

      // Cek apakah masih ada halaman selanjutnya
      nextPageToken = response.data.nextPageToken;
      if (!nextPageToken) {
        hasNextPage = false;
      }
    }

    return allComments;
  } catch (error) {
    console.error(
      "[YouTube Service] Error fetching all comments:",
      error.message,
    );

    // Jika komentar dimatikan (403), return array kosong (bukan error fatal)
    // agar proses analisis tetap bisa 'sukses' dengan hasil 0 komentar.
    if (error.code === 403) {
      return [];
    }

    throw new AppError(
      `Gagal mengambil seluruh komentar: ${error.message}`,
      502,
    );
  }
};

/**
 * Mengambil satu video berdasarkan ID.
 * Digunakan untuk fitur Search by URL.
 */
const getVideoById = async (tokens, videoId) => {
  try {
    const youtube = getClient(tokens);

    // Cost: 1 Unit
    const response = await youtube.videos.list({
      part: "snippet,statistics,status",
      id: videoId,
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new AppError("Video tidak ditemukan atau bersifat privat.", 404);
    }

    const item = response.data.items[0];

    // PENTING: Validasi Kepemilikan (Optional tapi Recommended)
    // Kita cek apakah channelId video ini sama dengan channelId user yang login?
    // Jika tidak, kita bisa beri flag "isOwner: false" agar frontend mematikan tombol hapus.

    // Untuk saat ini, kita return datanya saja.
    return {
      id: item.id,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      statistics: {
        viewCount: item.statistics.viewCount || "0",
        likeCount: item.statistics.likeCount || "0",
        commentCount: item.statistics.commentCount || "0",
      },
    };
  } catch (error) {
    if (error.statusCode === 404) throw error;
    console.error("[YouTube Service] Error searching video:", error.message);
    throw new AppError(`Gagal mencari video: ${error.message}`, 502);
  }
};

/**
 * Mengubah status moderasi komentar (Support Bulk/Batch).
 * Digunakan untuk: Hapus Spam (rejected) atau Tahan (heldForReview).
 * * @param {Object} tokens - Token Akses OAuth2
 * @param {Array<String>} commentIds - List ID Komentar YouTube (bukan ID Mongo)
 * @param {String} status - 'rejected' | 'heldForReview' | 'published'
 * @param {Boolean} banAuthor - Apakah user penulisnya juga di-banned? (Default: false)
 */
const setModerationStatus = async (
  tokens,
  commentIds,
  status = "rejected",
  banAuthor = false,
) => {
  try {
    const youtube = getClient(tokens);

    // 1. Validasi Input
    if (!commentIds || commentIds.length === 0) {
      return { success: true, successCount: 0, failCount: 0 };
    }

    // 2. Strategi Chunking (Pemecahan Paket)
    // URL Request YouTube memiliki batas panjang karakter.
    // Mengirim 50 ID sekaligus (dipisah koma) adalah batas aman & efisien.
    const CHUNK_SIZE = 50;
    const chunks = [];

    for (let i = 0; i < commentIds.length; i += CHUNK_SIZE) {
      chunks.push(commentIds.slice(i, i + CHUNK_SIZE));
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    console.log(
      `[YouTube Service] Memproses moderasi ${commentIds.length} komentar dalam ${chunks.length} batch...`,
    );

    // 3. Eksekusi Paralel (Promise.all)
    // Kita kirim semua batch secara bersamaan agar prosesnya super cepat (< 2 detik)
    const promises = chunks.map(async (chunkIds) => {
      try {
        // API Call: setModerationStatus menerima ID dipisah koma
        await youtube.comments.setModerationStatus({
          id: chunkIds.join(","), // Contoh: "id1,id2,id3"
          moderationStatus: status,
          banAuthor: banAuthor,
        });

        successCount += chunkIds.length;
      } catch (err) {
        console.error(`[YouTube Service] Gagal moderasi batch: ${err.message}`);
        failCount += chunkIds.length;
        errors.push(err.message);
        // Kita catch error di sini agar batch lain yang sukses tidak ikut gagal
      }
    });

    await Promise.all(promises);

    return {
      success: failCount === 0, // Sukses total jika tidak ada yang gagal
      totalRequested: commentIds.length,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error) {
    console.error(
      "[YouTube Service] Critical Error setModerationStatus:",
      error.message,
    );
    throw new AppError(
      `Gagal melakukan moderasi ke YouTube: ${error.message}`,
      502,
    );
  }
};

/**
 * Mencari Info Channel berdasarkan Handle (Username)
 * Contoh: input '@gadgetin' -> output { id: 'UC...', title: 'GadgetIn' }
 */
const getChannelInfoByHandle = async (tokens, handle) => {
  const oauth2Client = new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
  );
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  try {
    const response = await youtube.channels.list({
      part: "id,snippet",
      forHandle: handle, // Parameter khusus untuk cari via handle
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      throw new AppError(
        `Channel dengan handle '${handle}' tidak ditemukan.`,
        404,
      );
    }

    return {
      channelId: items[0].id,
      channelName: items[0].snippet.title,
      thumbnail: items[0].snippet.thumbnails.default.url,
    };
  } catch (error) {
    console.error("[YouTube Service] Error resolving handle:", error);
    throw error;
  }
};

// ---------------------------------------

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
      authClient = google.youtube({ version: "v3", auth: apiKey });
      console.log(
        `[YouTubeService] Mengambil detail video ${videoId} menggunakan API Key.`,
      );
    } else {
      throw new AppError(
        "Diperlukan youtubeClient (terautentikasi) atau apiKey untuk mengambil detail video.",
        500,
      );
    }
  } else {
    console.log(
      `[YouTubeService] Mengambil detail video ${videoId} menggunakan client terautentikasi.`,
    );
  }

  try {
    const response = await authClient.videos.list({
      part: "snippet,contentDetails,statistics",
      id: videoId,
    });

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0];
    }
    throw new NotFoundError(
      `Video dengan ID ${videoId} tidak ditemukan atau tidak dapat diakses.`,
    );
  } catch (error) {
    console.error(
      `[YouTubeService] Error mengambil detail video ${videoId}:`,
      error.response ? error.response.data : error.message,
    );
    if (error instanceof NotFoundError) throw error; // Teruskan error NotFoundError

    if (
      error.code === 403 &&
      error.message &&
      error.message.includes("quotaExceeded")
    ) {
      throw new AppError(
        "Kuota YouTube API telah terlampaui. Silahkan coba lagi esok hari",
        429,
      ); // Too Many Requests
    }

    if (error.code === 404) {
      throw new NotFoundError(
        `Video dengan ID ${videoId} tidak ditemukan (API Error).`,
      );
    }
    throw new AppError(
      `Gagal mengambil detail video: ${error.message}`,
      error.code && typeof error.code === "number" ? error.code : 500,
    );
  }
};

const fetchCommentsForVideo = async (
  videoId,
  userId,
  { youtubeClient },
  maxResultsPerPage = 100,
  limitTotalResults = 1000,
) => {
  if (!youtubeClient) {
    throw new AppError(
      "Diperlukan youtubeClient yang terautentikasi untuk mengambil komentar.",
      500,
    );
  }

  let allCommentThreads = [];
  let nextPageToken = null;
  let fetchedCount = 0;
  const actualMaxPerPage = Math.min(maxResultsPerPage, 100);

  console.log(
    `[YouTubeService] Mulai mengambil komentar (threads) untuk video ID: ${videoId}. UserID: ${userId}. Target: ${limitTotalResults} komentar.`,
  );

  try {
    do {
      const resultsToFetchThisPage = Math.min(
        actualMaxPerPage,
        limitTotalResults - fetchedCount,
      );
      if (resultsToFetchThisPage <= 0) break;

      console.log(
        `[YouTubeService] Mengambil halaman commentThreads... PageToken: ${nextPageToken}, MaxResults: ${resultsToFetchThisPage}`,
      );
      const response = await youtubeClient.commentThreads.list({
        part: "snippet,replies",
        videoId: videoId,
        maxResults: resultsToFetchThisPage,
        pageToken: nextPageToken,
        textFormat: "plainText",
        order: "time",
      });

      if (response.data.items && response.data.items.length > 0) {
        response.data.items.forEach((threadItem) => {
          if (
            threadItem &&
            threadItem.snippet &&
            threadItem.snippet.topLevelComment &&
            threadItem.snippet.topLevelComment.id &&
            threadItem.snippet.topLevelComment.snippet
          ) {
            const initialReplies = [];
            if (threadItem.replies && threadItem.replies.comments) {
              threadItem.replies.comments = threadItem.replies.comments.filter(
                (reply) => reply && reply.id && reply.snippet,
              );

              threadItem.replies.comments.forEach((replyComment) => {
                if (replyComment && replyComment.id && replyComment.snippet) {
                  initialReplies.push({
                    id: replyComment.id,
                    textDisplay: replyComment.snippet.textDisplay,
                    authorDisplayName: replyComment.snippet.authorDisplayName,
                    publishedAt: replyComment.snippet.publishedAt,
                    likeCount: replyComment.snippet.likeCount,
                    parentId: replyComment.snippet.parentId, // Seharusnya ID dari topLevelComment
                  });
                }
              });
            }

            allCommentThreads.push(threadItem);
            fetchedCount++;
          } else {
            console.warn(
              `[YouTubeService] Item commentThread tidak memiliki struktur yang diharapkan, dilewati:`,
              JSON.stringify(threadItem, null, 2),
            );
          }
        });
      }

      nextPageToken = response.data.nextPageToken;
      console.log(
        `[YouTubeService] Fetched ${fetchedCount} comment threads so far for video ${videoId}. Next page: ${!!nextPageToken}`,
      );
    } while (nextPageToken && fetchedCount < limitTotalResults);

    console.log(
      `[YouTubeService] Total ${allCommentThreads.length} comment threads diambil untuk video ID: ${videoId}`,
    );
    return allCommentThreads;
  } catch (error) {
    const isQuotaError =
      error.response?.data?.error?.errors?.[0]?.reason === "quotaExceeded" ||
      error.message?.toLowerCase().includes("quotaexceeded");

    if (isQuotaError) {
      console.error(
        `[YouTubeService] QUOTA EXCEEDED saat mencoba mengakses resource untuk video ${videoId}. UserID: ${userId}.`,
      );

      throw new QuotaExceededError(
        "Kuota harian YouTube API telah habis. Silakan coba lagi besok.",
      );
    }

    console.error(
      `[YouTubeService] Error mengambil commentThreads untuk video ${videoId} (UserID: ${userId}):`,
      error.response ? error.response.data : error.message,
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
          2,
        ),
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
        403,
      );
    }
    throw new AppError(
      `Gagal mengambil komentar: ${googleApiErrorMessage}`,
      error.code && typeof error.code === "number" ? error.code : 500,
    );
  }
};

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
      `[YOUTUBE_SERVICE] Komentar ${youtubeCommentId} berhasil dihapus permanen oleh pemilik.`,
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
  { youtubeClient },
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
      `[YOUTUBE_SERVICE] Komentar ${youtubeCommentId} dimoderasi ke status: ${moderationStatus}`,
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
  // getAuthenticatedYouTubeClient,
  getClient,
  getChannelIdentity,
  getChannelVideos,
  getVideoComments,
  getAllComments,
  getVideoById,
  setModerationStatus,
  getChannelInfoByHandle,
  getVideoDetails,
  fetchCommentsForVideo,
  deleteYoutubeComment,
  moderateYoutubeComment,
};
