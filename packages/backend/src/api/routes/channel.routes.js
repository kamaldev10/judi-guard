// /src/api/routes/channel.routes.js
const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channel.controller");
const ensureYoutubeAccess = require("../middlewares/ensureYoutubeAccess");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get(
  "/",
  isAuthenticated,
  ensureYoutubeAccess,
  channelController.getMyVideos,
);

router.get(
  "/search",
  isAuthenticated,
  ensureYoutubeAccess,
  channelController.searchVideoById,
);

router.get(
  "/:videoId/comments",
  isAuthenticated,
  ensureYoutubeAccess,
  channelController.getVideoComments,
);

module.exports = router;
