import express from 'express';
import channelController from '#modules/channel/channel.controller.js';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';
import requireYoutubeAccess from '#middlewares/require-youtube-access.js';

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requirePermission('channel:read'),
  requireYoutubeAccess,
  channelController.getMyVideos,
);

router.get(
  '/search',
  requireAuth,
  requirePermission('channel:read'),
  requireYoutubeAccess,
  channelController.searchVideoById,
);

router.get(
  '/:videoId/comments',
  requireAuth,
  requirePermission('channel:read'),
  requireYoutubeAccess,
  channelController.getVideoComments,
);

export default router;
