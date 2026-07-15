import express from 'express';
import * as videoAnalysisController from './video-analysis.controller.js';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';
import requireYoutubeAccess from '#middlewares/require-youtube-access.js';

const router = express.Router();

// Deprecate old analysis routes — letakkan BEFORE route /:videoId
// agar tidak ditelan oleh parameter :videoId
router.all('/videos', (req, res) => {
  res.status(410).json({
    status: 'fail',
    message: 'Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.',
  });
});
router.all('/videos/:analysisId/comments', (req, res) => {
  res.status(410).json({
    status: 'fail',
    message: 'Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.',
  });
});
router.all('/comments/:analyzedCommentId', (req, res) => {
  res.status(410).json({
    status: 'fail',
    message: 'Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.',
  });
});
router.all('/videos/:analysisId/judi-comments', (req, res) => {
  res.status(410).json({
    status: 'fail',
    message: 'Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.',
  });
});

router.get(
  '/history',
  requireAuth,
  requirePermission('analysis:read'),
  videoAnalysisController.getHistory,
);

router.post(
  '/:videoId',
  requireAuth,
  requirePermission('analysis:start'),
  requireYoutubeAccess,
  videoAnalysisController.startAnalysis,
);

router.get(
  '/status/:analysisId',
  requireAuth,
  requirePermission('analysis:read'),
  videoAnalysisController.getAnalysisStatus,
);

router.get(
  '/:analysisId/results',
  requireAuth,
  requirePermission('analysis:read'),
  videoAnalysisController.getAnalysisResults,
);

router.post(
  '/:analysisId/action',
  requireAuth,
  requirePermission('analysis:moderate'),
  requireYoutubeAccess,
  videoAnalysisController.executeAction,
);

router.post(
  '/:analysisId/undo',
  requireAuth,
  requirePermission('analysis:moderate'),
  requireYoutubeAccess,
  videoAnalysisController.undoAction,
);

router.get(
  '/report/preview',
  requireAuth,
  requirePermission('analysis:report'),
  videoAnalysisController.getReportPreview,
);

router.get(
  '/report/download',
  requireAuth,
  requirePermission('analysis:report'),
  videoAnalysisController.downloadPeriodReport,
);

router.get(
  '/:analysisId/report/pdf',
  requireAuth,
  requirePermission('analysis:report'),
  videoAnalysisController.downloadReport,
);

// Deprecate old analysis routes
router.all(
  [
    '/videos',
    '/videos/:analysisId/comments',
    '/comments/:analyzedCommentId',
    '/videos/:analysisId/judi-comments',
  ],
  (req, res) => {
    res.status(410).json({
      status: 'fail',
      message: 'Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.',
    });
  },
);

export default router;
