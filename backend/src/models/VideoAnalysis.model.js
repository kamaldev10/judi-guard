// src/models/VideoAnalysis.model.js
const mongoose = require("mongoose");

const videoAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referensi ke model User
      required: true,
    },
    youtubeVideoId: {
      type: String,
      required: true,
    },
    videoTitle: {
      // Opsional, bisa diisi saat mengambil detail video
      type: String,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    totalCommentsFetched: {
      // Jumlah komentar yang berhasil diambil
      type: Number,
      default: 0,
    },
    totalCommentsAnalyzed: {
      // Jumlah komentar yang berhasil dianalisis
      type: Number,
      default: 0,
    },
    errorMessage: {
      // Jika status FAILED
      type: String,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processingStartedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true } // createdAt dan updatedAt otomatis
);

// Index untuk query yang lebih efisien
videoAnalysisSchema.index({ userId: 1, youtubeVideoId: 1 });
videoAnalysisSchema.index({ status: 1 });

const VideoAnalysis = mongoose.model("VideoAnalysis", videoAnalysisSchema);

module.exports = VideoAnalysis;
