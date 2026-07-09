import * as studioService from './studio.service.js';

/**
 * Menangani permintaan untuk mendapatkan link YouTube Studio.
 */
export const getYouTubeStudioCommentLink = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user._id;

    const studioUrl = await studioService.generateCommentLink(
      analysisId,
      userId
    );

    res.status(200).json({
      success: true,
      message: "Link YouTube Studio berhasil dibuat.",
      data: { url: studioUrl },
    });
  } catch (error) {
    next(error);
  }
};
