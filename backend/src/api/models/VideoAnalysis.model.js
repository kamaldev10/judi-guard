// src/models/VideoAnalysis.model.js
const mongoose = require("mongoose");

const videoAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    youtubeVideoId: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
    },
    status: {
      type: String,
      // PERBAIKAN: Tambahkan semua status baru yang terkait dengan proses penghapusan
      enum: [
        "PENDING",
        "PROCESSING",
        "COMPLETED",
        "FAILED",
        "DELETING_CLASSIFIED_COMMENTS", // Status saat proses hapus berjalan
        "COMPLETED_ALL_DELETIONS_SUCCESSFULLY", // Status jika semua berhasil dihapus
        "COMPLETED_DELETION_WITH_PARTIAL_ERRORS", // Status jika ada yang gagal dihapus
        "FAILED_ALL_DELETIONS", // Status jika semua gagal dihapus
        // Anda juga bisa menggunakan status yang lebih umum seperti "COMPLETED_JUDI_DELETION"
      ],
      default: "PENDING",
    },
    totalCommentsFetched: {
      type: Number,
      default: 0,
    },
    totalCommentsAnalyzed: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
    // Menambahkan field untuk melacak status batch delete (opsional tapi informatif)
    lastBatchDeletionAttemptAt: { type: Date },
    lastBatchDeletionSuccessCount: { type: Number },
    lastBatchDeletionFailureCount: { type: Number },
    // ...
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processingStartedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Index tetap sama
videoAnalysisSchema.index({ userId: 1, youtubeVideoId: 1 });
videoAnalysisSchema.index({ status: 1 });

const VideoAnalysis = mongoose.model("VideoAnalysis", videoAnalysisSchema);

module.exports = VideoAnalysis;
