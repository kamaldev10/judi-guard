import { UserRepository } from '#modules/user/user.repository.js';
import googleOAuth2Client from '#shared/clients/google-oauth2.client.js';
import { google } from 'googleapis';
import { AppError, NotFoundError } from '#shared/utils/errors.js';

/**
 * YouTube OAuth callback — menyimpan token dan info channel ke User document.
 */
export const handleYoutubeOAuthCallback = async (authCode, judiGuardUserId) => {
  try {
    const oAuth2Client = googleOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(authCode);

    const updateData = {
      youtubeAccessToken: tokens.access_token,
      youtubeTokenExpiresAt: new Date(tokens.expiry_date),
      isYoutubeConnected: true,
    };

    if (tokens.refresh_token) {
      updateData.youtubeRefreshToken = tokens.refresh_token;
    }

    oAuth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

    try {
      const channelInfoResponse = await youtube.channels.list({
        mine: true,
        part: 'id,snippet',
      });

      if (channelInfoResponse.data.items?.length > 0) {
        const channel = channelInfoResponse.data.items[0];
        updateData.youtubeChannelId = channel.id;
        updateData.youtubeChannelName = channel.snippet.title;
        updateData.youtubeChannelThumbnailUrl = channel.snippet.thumbnails?.default?.url;
      }
    } catch (channelError) {
      console.error('Gagal mendapatkan info channel:', channelError.message);
    }

    const updatedUser = await UserRepository.updateById(judiGuardUserId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new AppError('User tidak ditemukan.', 404);
    }

    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.youtubeAccessToken;
    delete userResponse.youtubeRefreshToken;

    return { message: 'Akun YouTube berhasil terhubung!', user: userResponse };
  } catch (error) {
    console.error('Error callback OAuth:', error.message);
    throw new AppError(`Gagal menghubungkan YouTube: ${error.message}`, 500);
  }
};

/**
 * Putuskan koneksi YouTube — hapus token & info channel dari User.
 */
export const disconnectYouTubeAccount = async (userId) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw new NotFoundError('Pengguna tidak ditemukan.');

  user.youtubeAccessToken = undefined;
  user.youtubeRefreshToken = undefined;
  user.youtubeTokenExpiresAt = undefined;
  user.youtubeChannelId = undefined;
  user.youtubeChannelName = undefined;
  user.isYoutubeConnected = false;

  await user.save();

  const userToReturn = user.toObject();
  delete userToReturn.password;
  delete userToReturn.youtubeAccessToken;
  delete userToReturn.youtubeRefreshToken;

  return userToReturn;
};
