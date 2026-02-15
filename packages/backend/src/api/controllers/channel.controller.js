//* src/api/controllers/channel.controller.js
const youtubeService = require("../services/youtube.service");
const { getYouTubeVideoId } = require("../../utils/youtubeHelper");
const { AppError } = require("../../utils/errors");

/**
 * Controller untuk mengambil daftar video.
 * Route: GET /api/videos
 */
const getMyVideos = async (req, res, next) => {
  try {
    // Ambil token yang sudah disiapkan middleware
    const tokens = req.youtubeTokens;
    const { pageToken } = req.query;

    const data = await youtubeService.getChannelVideos(tokens, pageToken);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller untuk mengambil komentar video.
 * Route: GET /api/videos/:videoId/comments
 */
const getVideoComments = async (req, res, next) => {
  try {
    const tokens = req.youtubeTokens;
    const { videoId } = req.params;
    const { pageToken } = req.query;

    const data = await youtubeService.getVideoComments(
      tokens,
      videoId,
      pageToken,
    );

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mencari Video berdasarkan URL atau ID
 * Route: GET /api/videos/search?query=...
 */
const searchVideoById = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query) throw new AppError("Masukkan URL atau ID video YouTube.", 400);

    const videoId = getYouTubeVideoId(query);
    if (!videoId) throw new AppError("Format URL YouTube tidak valid.", 400);

    const tokens = req.youtubeTokens;
    const currentUserChannel = req.channelIdentity;

    // 1. Ambil Detail Video dari YouTube (Cost: 1 Unit)
    const videoData = await youtubeService.getVideoById(tokens, videoId);

    // 2. LOGIKA KEPEMILIKAN (OPTIMIZED)
    let myChannelId;

    if (currentUserChannel && currentUserChannel.id) {
      myChannelId = currentUserChannel.id;
    } else if (req.user && req.user.youtubeChannelId) {
      myChannelId = req.user.youtubeChannelId;
    } else {
      myChannelId = await youtubeService.getMyChannelId(tokens);
    }

    // 3. Bandingkan
    if (!myChannelId || videoData.channelId !== myChannelId) {
      throw new AppError(
        "Akses Ditolak: Video ini bukan milik channel Anda.",
        403,
      );
    }

    res.status(200).json({
      status: "success",
      data: videoData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyVideos, getVideoComments, searchVideoById };
