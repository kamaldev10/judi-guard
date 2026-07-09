import { UserRepository } from '#modules/user/user.repository.js';
import { AppError } from '#shared/utils/errors.js';
import googleOAuth2Client from '#shared/clients/google-oauth2.client.js';

// Mutex map to prevent concurrent refresh requests for the same user
const refreshMutex = new Map();

/**
 * Middleware requireYoutubeAccess:
 * 1. Membaca token YouTube dari user yang sudah terautentikasi (req.user).
 * 2. Menggunakan Google OAuth2 Client untuk memverifikasi/penyegaran token otomatis jika sudah hampir kadaluarsa (<= 5 menit).
 * 3. Jika token kadaluarsa dan refresh gagal, hapus token di DB dan return 422.
 * 4. Pasang req.youtube = { tokens, channelId, channelName }
 * 5. Pasang properti legacy untuk kompatibilitas: req.youtubeTokens dan req.channelIdentity.
 */
const requireYoutubeAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return next(new AppError('Hubungkan akun YouTube terlebih dahulu', 409));
    }

    const userId = req.user._id.toString();

    // Ambil data token YouTube yang sensitif dari database
    const user = await UserRepository.findByIdWithTokens(userId);

    if (!user || !user.youtubeAccessToken) {
      return next(new AppError('Hubungkan akun YouTube terlebih dahulu', 409));
    }

    const oauth2Client = googleOAuth2Client();

    oauth2Client.setCredentials({
      access_token: user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken,
      expiry_date: user.youtubeTokenExpiresAt ? user.youtubeTokenExpiresAt.getTime() : null,
    });

    const fiveMinutesInMs = 5 * 60 * 1000;
    const needsRefresh =
      user.youtubeTokenExpiresAt &&
      user.youtubeTokenExpiresAt.getTime() < Date.now() + fiveMinutesInMs;

    if (needsRefresh) {
      // Mencegah request refresh ganda jika ada panggilan beruntun
      if (!refreshMutex.has(userId)) {
        refreshMutex.set(
          userId,
          (async () => {
            try {
              console.log(`[requireYoutubeAccess] Refreshing YouTube access token for user ${userId}...`);
              const { credentials } = await oauth2Client.refreshAccessToken();
              return credentials;
            } finally {
              refreshMutex.delete(userId);
            }
          })()
        );
      }

      try {
        const credentials = await refreshMutex.get(userId);
        oauth2Client.setCredentials(credentials);

        user.youtubeAccessToken = credentials.access_token;
        if (credentials.refresh_token) {
          user.youtubeRefreshToken = credentials.refresh_token;
        }
        user.youtubeTokenExpiresAt = credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null;
        await user.save();
        console.log(`[requireYoutubeAccess] Token refreshed successfully for user ${userId}.`);
      } catch (refreshError) {
        console.error(`[requireYoutubeAccess] Gagal me-refresh token untuk user ${userId}:`, refreshError.message);
        
        // Hapus token yang rusak di DB agar status sinkronisasi diperbarui
        user.youtubeAccessToken = undefined;
        user.youtubeRefreshToken = undefined;
        user.youtubeTokenExpiresAt = undefined;
        user.isYoutubeConnected = false;
        await user.save();

        return next(new AppError('Sesi YouTube kedaluwarsa, hubungkan ulang', 422));
      }
    }

    const tokens = {
      access_token: user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken,
      expiry_date: user.youtubeTokenExpiresAt ? user.youtubeTokenExpiresAt.getTime() : null,
    };

    // Set output sesuai spesifikasi
    req.youtube = {
      tokens,
      channelId: user.youtubeChannelId,
      channelName: user.youtubeChannelName,
    };

    // Legacy support untuk downstream controller/services lama
    req.youtubeTokens = tokens;
    req.channelIdentity = {
      id: user.youtubeChannelId,
      title: user.youtubeChannelName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default requireYoutubeAccess;
