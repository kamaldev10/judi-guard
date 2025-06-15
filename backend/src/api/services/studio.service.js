const mongoose = require("mongoose");
const VideoAnalysis = require("../models/VideoAnalysis.model");
const User = require("../models/User.model"); // <-- 1. Impor model User
const { NotFoundError } = require("../../utils/errors");

/**
 * Menghasilkan link "pintar" ke YouTube Studio yang menyertakan petunjuk akun.
 * @param {string} analysisId - ID dari VideoAnalysis.
 * @param {string} userId - ID User untuk validasi kepemilikan.
 * @returns {Promise<string>} URL ke YouTube Studio dengan parameter authuser.
 */
const generateCommentLink = async (analysisId, userId) => {
  // Validasi kepemilikan (tetap sama dan sudah benar)
  const videoAnalysis = await VideoAnalysis.findOne({
    _id: new mongoose.Types.ObjectId(analysisId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!videoAnalysis) {
    throw new NotFoundError(
      "Data analisis tidak ditemukan atau Anda tidak memiliki akses."
    );
  }

  // <<< PERUBAHAN BARU: Ambil data email pengguna >>>
  const user = await User.findById(userId).select("email");
  if (!user) {
    throw new NotFoundError("Data pengguna tidak ditemukan.");
  }

  const { youtubeVideoId } = videoAnalysis;
  const userEmail = user.email;

  // <<< PERUBAHAN KUNCI: Tambahkan parameter ?authuser=EMAIL ke URL >>>
  const studioUrl = `https://studio.youtube.com/video/${youtubeVideoId}/comments?authuser=${userEmail}`;

  console.log(`[StudioService] Generated smart link: ${studioUrl}`); // Log untuk debugging

  return studioUrl;
};

module.exports = {
  generateCommentLink,
};
