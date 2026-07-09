import mongoose from 'mongoose';

// Schema untuk Whitelist (Akun/Channel Aman)
const whitelistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channelId: { type: String, required: true }, // ID Channel YouTube
    channelName: { type: String, default: "Unknown" }, // Nama Channel (untuk display)
    note: { type: String }, // Catatan user
  },
  { timestamps: true },
);

// Schema untuk Blacklist (Kata Terlarang)
const blacklistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    keyword: { type: String, required: true }, // Kata kuncinya
    matchType: {
      type: String,
      enum: ["CONTAINS", "EXACT"],
      default: "CONTAINS",
    },
  },
  { timestamps: true },
);

// Index agar pencarian cepat per user
whitelistSchema.index({ userId: 1, channelId: 1 }, { unique: true });
blacklistSchema.index({ userId: 1, keyword: 1 }, { unique: true });

const Whitelist = mongoose.model("Whitelist", whitelistSchema);
const Blacklist = mongoose.model("Blacklist", blacklistSchema);

export { Whitelist, Blacklist };
