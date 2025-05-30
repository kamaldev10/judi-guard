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
      type: String,
      required: true,
    },
    youtubeCommentId: {
      // ID unik komentar dari YouTube
      type: String,
      required: true,
      unique: true, // CUKUP DENGAN INI UNTUK UNIQUE INDEX PADA FIELD INI
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
    totalReplyCount: { type: Number, default: 0 },
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
analyzedCommentSchema.index({ userId: 1, youtubeVideoId: 1 });
analyzedCommentSchema.index({ classification: 1 });
// HAPUS BARIS BERIKUT KARENA unique:true DI FIELD youtubeCommentId SUDAH CUKUP:
// analyzedCommentSchema.index({ youtubeCommentId: 1 }, { unique: true });

const AnalyzedComment = mongoose.model(
  "AnalyzedComment",
  analyzedCommentSchema
);

module.exports = AnalyzedComment;
