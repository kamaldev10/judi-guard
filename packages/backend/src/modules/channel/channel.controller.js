import { getYouTubeVideoId } from '#shared/utils/youtube-helper.js';
import { AppError } from '#shared/utils/errors.js';
import {
  getChannelVideos,
  getYoutubeVideoComments,
  getVideoById,
  getMyChannelId,
} from '#shared/services/youtube.service.js';

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
