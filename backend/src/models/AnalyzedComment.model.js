// src/models/AnalyzedComment.model.js
const mongoose = require("mongoose");

const analyzedCommentSchema = new mongoose.Schema(
  {
    videoAnalysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoAnalysis",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    youtubeVideoId: {
      // ID video YouTube tempat komentar ini berada
      type: String,
      required: true,
    },
    youtubeCommentId: {
      // ID unik komentar dari YouTube (bisa top-level atau reply)
      type: String,
      required: true,
      unique: true,
    },
    parentYoutubeCommentId: {
      // ID komentar YouTube induk jika ini adalah balasan
      type: String, // Akan null atau undefined jika ini adalah komentar tingkat atas
      index: true, // Tambahkan index jika Anda sering query berdasarkan ini
    },
    commentTextOriginal: {
      type: String,
      required: true,
    },
    commentTextDisplay: {
      type: String,
      required: true,
    },
    commentAuthorDisplayName: { type: String },
    commentAuthorChannelId: { type: String },
    commentAuthorProfileImageUrl: { type: String },
    commentPublishedAt: { type: Date },
    commentUpdatedAt: { type: Date },
    likeCount: { type: Number, default: 0 },
    // totalReplyCount hanya relevan untuk top-level comments jika Anda menyimpannya di sini.
    // Jika tidak, field ini bisa dihapus dari AnalyzedComment dan hanya ada di CommentThread dari YouTube API.
    // Untuk V1 ini, kita bisa hapus dari model AnalyzedComment untuk menyederhanakan,
    // karena totalReplyCount ada di objek CommentThread dari youtube.service.js.
    // totalReplyCount: { type: Number, default: 0 },
    classification: {
      type: String,
      enum: [
        "JUDI",
        "NON_JUDI",
        "PENDING_ANALYSIS",
        "ERROR_ANALYSIS",
        "UNKNOWN",
      ],
      default: "PENDING_ANALYSIS",
    },
    aiConfidenceScore: { type: Number },
    aiModelVersion: { type: String },
    isDeletedOnYoutube: { type: Boolean, default: false },
    deletionAttemptedAt: { type: Date },
    deletionError: { type: String },
  },
  { timestamps: true }
);

// Index untuk query yang lebih efisien
analyzedCommentSchema.index({ videoAnalysisId: 1 });
analyzedCommentSchema.index({ userId: 1, youtubeVideoId: 1 }); // Mungkin tidak perlu userId di sini jika sudah ada di videoAnalysisId
analyzedCommentSchema.index({ classification: 1 });
// Index untuk youtubeCommentId sudah ada karena unique: true

const AnalyzedComment = mongoose.model(
  "AnalyzedComment",
  analyzedCommentSchema
);

module.exports = AnalyzedComment;
