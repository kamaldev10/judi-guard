// /src/api/routes/channel.routes.js
const express = require("express");
const router = express.Router();
const channelController = require("../controllers/channel.controller");
const ensureYoutubeAccess = require("../middlewares/ensureYoutubeAccess");

router.use(ensureYoutubeAccess);

router.get("/", channelController.getMyVideos);

router.get("/search", channelController.searchVideoById);

router.get("/:videoId/comments", channelController.getVideoComments);

module.exports = router;
