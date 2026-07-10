import { getYouTubeVideoId } from '#shared/utils/youtube-helper.js';
import { AppError } from '#shared/utils/errors.js';
import {
  getChannelVideos,
  getYoutubeVideoComments,
  getVideoById,
  getMyChannelId,
} from '#shared/services/youtube.service.js';

/**
 * @openapi
 * /videos/:
 *   get:
 *     tags: [Channels]
 *     summary: Daftar video channel
 *     description: Mengambil daftar video dari channel YouTube yang terhubung
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageToken
 *         schema:
 *           type: string
 *         description: Token paginasi YouTube
 *     responses:
 *       200:
 *         description: Daftar video
 *       409:
 *         description: YouTube belum terhubung
 */
const getMyVideos = async (req, res, next) => {
  try {
    const tokens = req.youtubeTokens;
    const { pageToken } = req.query;

    const data = await getChannelVideos(tokens, pageToken);

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /videos/{videoId}/comments:
 *   get:
 *     tags: [Channels]
 *     summary: Preview komentar video
 *     description: Mengambil komentar dari video YouTube tertentu
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: pageToken
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Komentar video
 */
const getVideoComments = async (req, res, next) => {
  try {
    const tokens = req.youtubeTokens;
    const { videoId } = req.params;
    const { pageToken } = req.query;

    const data = await getYoutubeVideoComments(tokens, videoId, pageToken);

    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /videos/search:
 *   get:
 *     tags: [Channels]
 *     summary: Cari video
 *     description: Mencari video berdasarkan URL/ID (hanya milik channel sendiri)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: URL atau ID video YouTube
 *     responses:
 *       200:
 *         description: Data video
 *       403:
 *         description: Video bukan milik channel Anda
 */
const searchVideoById = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) throw new AppError('Masukkan URL atau ID video YouTube.', 400);

    const videoId = getYouTubeVideoId(query);
    if (!videoId) throw new AppError('Format URL YouTube tidak valid.', 400);

    const tokens = req.youtubeTokens;
    const currentUserChannel = req.channelIdentity;

    const videoData = await getVideoById(tokens, videoId);

    let myChannelId;

    if (currentUserChannel && currentUserChannel.id) {
      myChannelId = currentUserChannel.id;
    } else if (req.user && req.user.youtubeChannelId) {
      myChannelId = req.user.youtubeChannelId;
    } else {
      myChannelId = await getMyChannelId(tokens);
    }

    if (!myChannelId || videoData.channelId !== myChannelId) {
      throw new AppError('Akses Ditolak: Video ini bukan milik channel Anda.', 403);
    }

    res.status(200).json({
      status: 'success',
      data: videoData,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getMyVideos,
  getVideoComments,
  searchVideoById,
};
