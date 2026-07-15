import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('TokenBlacklist', tokenBlacklistSchema);
