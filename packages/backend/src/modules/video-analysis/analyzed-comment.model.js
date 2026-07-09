import mongoose from 'mongoose';

const analyzedCommentSchema = new mongoose.Schema(
  {
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoAnalysis',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    youtubeVideoId: {
      type: String,
      required: true,
      index: true,
    },
    youtubeCommentId: {
      type: String,
      required: true,
      unique: true,
    },
    parentYoutubeCommentId: {
      type: String,
      default: null,
      index: true,
    },

    // --- TEKS KOMENTAR ---
    commentTextOriginal: {
      type: String,
      required: true,
    },
    commentTextDisplay: {
      type: String,
      required: true,
    },

    // --- INFO AUTHOR ---
    commentAuthorDisplayName: { type: String },
    commentAuthorChannelId: { type: String },
    commentAuthorProfileImageUrl: { type: String },

    // --- TIMESTAMPS VIDEO ---
    commentPublishedAt: { type: Date },
    commentUpdatedAt: { type: Date },
    likeCount: { type: Number, default: 0 },

    // --- HASIL ANALISIS ---
    processingStatus: {
      type: String,
      enum: ['UNPROCESSED', 'PROCESSED', 'FAILED'],
      default: 'UNPROCESSED',
      index: true,
    },
    classification: {
      type: String,
      enum: ['JUDI', 'NON_JUDI', 'UNKNOWN'],
      default: 'UNKNOWN',
      index: true,
    },
    confidenceScore: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ['NONE', 'LOW', 'MEDIUM', 'HIGH'],
      default: 'NONE',
    },
    detectedKeywords: [{ type: String }],
    spamIndicators: { type: mongoose.Schema.Types.Mixed },
    aiModelVersion: { type: String },

    // --- Moderation Action ---
    actionTaken: {
      type: String,
      enum: ['NONE', 'DELETE', 'HOLD', 'RESTORED'],
      default: 'NONE',
      index: true,
    },
    actionTakenAt: {
      type: Date,
    },
    authorBanned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const AnalyzedComment = mongoose.model('AnalyzedComment', analyzedCommentSchema);

export default AnalyzedComment;
