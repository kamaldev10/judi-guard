// packages/backend/src/api/models/Video.model.js
const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  thumbnail: String,
  description: String,
  publishedAt: Date,
  //! Statistik dibuat optional, diisi nanti saat detail fetched
  statistics: {
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = {
  Video: mongoose.model("Video", videoSchema),
};
