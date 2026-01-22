const User = require("../models/User.model");
const { AppError } = require("../../utils/errors");
const { verifyToken } = require("../../utils/jwt");

/**
 * Middleware Hybrid:
 * 1. Cek apakah request membawa Token JWT (Member) -> Ambil Token YouTube dari DB.
 * 2. Jika tidak, cek apakah request membawa Cookie (Guest) -> Ambil Token YouTube dari Cookie.
 */
const ensureYoutubeAccess = async (req, res, next) => {
  try {
    let youtubeTokens = null;
    let channelIdentity = null;

    // --- STRATEGI 1: Cek Login Member (Via Header Authorization) ---
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);

        const user = await User.findById(decoded.id).select("+tokens");

        if (user && user.tokens && user.tokens.access_token) {
          req.user = user; // Set konteks user (opsional, untuk logging)
          youtubeTokens = user.tokens;
        }
      } catch (err) {
        // Token JWT kadaluarsa/invalid, abaikan dan lanjut cek mode Guest
        // Jangan throw error di sini, beri kesempatan cek cookie
      }
    }

    // 2. Cek Guest Cookie (Optimized Structure)
    if (!youtubeTokens && req.cookies.guest_session) {
      try {
        const sessionData = JSON.parse(req.cookies.guest_session);

        // Cek struktur baru: { tokens: ..., channel: ... }
        if (sessionData.tokens && sessionData.channel) {
          youtubeTokens = sessionData.tokens;
          channelIdentity = sessionData.channel;
          req.isGuest = true;
        }
        // Fallback untuk cookie lama (jika ada user yg belum logout)
        else if (sessionData.access_token) {
          youtubeTokens = sessionData;
        }
      } catch (err) {
        // Cookie invalid
      }
    }

    if (!youtubeTokens) {
      return next(
        new AppError("Akses Ditolak. Harap hubungkan akun YouTube Anda.", 401),
      );
    }

    // Attach ke Request
    req.youtubeTokens = youtubeTokens;
    req.channelIdentity = channelIdentity;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = ensureYoutubeAccess;
