import express from 'express';
import * as configController from './configuration.controller.js';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';
import requireYoutubeAccess from '#middlewares/require-youtube-access.js';

const router = express.Router();

// Whitelist Routes
router.post(
  '/whitelist',
  requireAuth,
  requirePermission('config:write'),
  requireYoutubeAccess,
  configController.addWhitelist,
);
router.get(
  '/whitelist',
  requireAuth,
  requirePermission('config:read'),
  requireYoutubeAccess,
  configController.getWhitelist,
);
router.delete(
  '/whitelist/:id',
  requireAuth,
  requirePermission('config:write'),
  requireYoutubeAccess,
  configController.deleteWhitelist,
);

// Blacklist Routes
router.post(
  '/blacklist',
  requireAuth,
  requirePermission('config:write'),
  requireYoutubeAccess,
  configController.addBlacklist,
);
router.get(
  '/blacklist',
  requireAuth,
  requirePermission('config:read'),
  requireYoutubeAccess,
  configController.getBlacklist,
);
router.delete(
  '/blacklist/:id',
  requireAuth,
  requirePermission('config:write'),
  requireYoutubeAccess,
  configController.deleteBlacklist,
);

export default router;
