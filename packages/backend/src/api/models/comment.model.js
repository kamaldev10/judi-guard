//* src/api/models/comment.model.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  youtubeId: { type: String, required: true, unique: true },
  videoId: { type: String, required: true, index: true },
  text: String,
  author: {
    name: String,
    profileImageUrl: String,
    channelId: String,
  },
  publishedAt: Date,
  likeCount: Number,
  totalReplyCount: Number,
  isPublic: Boolean,
});

module.exports = {
  Comment: mongoose.model("Comment", commentSchema),
};
