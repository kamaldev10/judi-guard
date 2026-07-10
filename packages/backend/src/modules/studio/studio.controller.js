import * as studioService from './studio.service.js';

/**
 * @openapi
 * /studio/comments-link/{analysisId}:
 *   get:
 *     tags: [Studio]
 *     summary: Link YouTube Studio
 *     description: Mendapatkan link langsung ke halaman moderasi komentar di YouTube Studio
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Link YouTube Studio
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
