const express = require("express");
const studioController = require("../controllers/studio.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

// Route untuk mendapatkan link moderasi komentar di YouTube Studio
router.get(
  "/comments-link/:analysisId",
  isAuthenticated,
  studioController.getYouTubeStudioCommentLink
);

module.exports = router;
