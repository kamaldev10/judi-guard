import express from 'express';
import * as studioController from './studio.controller.js';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';

const router = express.Router();

// Route untuk mendapatkan link moderasi komentar di YouTube Studio
router.get(
  '/comments-link/:analysisId',
  requireAuth,
  requirePermission('analysis:read'),
  studioController.getYouTubeStudioCommentLink,
);

export default router;
