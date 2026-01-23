//* packages/backend/src/api/models/VideoAnalysis.model.js
const mongoose = require("mongoose");

const videoAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    youtubeVideoId: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
      default: "Unknown Title",
    },

    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    moderationStatus: {
      type: String,
      enum: ["NONE", "CLEANED", "PARTIAL"],
      default: "NONE",
    },

    totalCommentsFetched: {
      type: Number,
      default: 0,
    },
    totalCommentsAnalyzed: {
      type: Number,
      default: 0,
    },
    totalSpamDetected: {
      type: Number,
      default: 0,
    },

    errorMessage: { type: String },

    lastBatchDeletionAttemptAt: { type: Date },
    lastBatchDeletionSuccessCount: { type: Number, default: 0 },
    lastBatchDeletionFailureCount: { type: Number, default: 0 },

    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processingStartedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

// Compound Index: Agar satu user bisa cari history video tertentu dengan cepat
videoAnalysisSchema.index({ userId: 1, youtubeVideoId: 1 });
videoAnalysisSchema.index({ status: 1 });

const VideoAnalysis = mongoose.model("VideoAnalysis", videoAnalysisSchema);

module.exports = VideoAnalysis;
