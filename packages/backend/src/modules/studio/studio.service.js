import mongoose from 'mongoose';
import { VideoAnalysisRepository } from '#modules/video-analysis/video-analysis.repository.js';
import { UserRepository } from '#modules/user/user.repository.js';
import { NotFoundError } from '#shared/utils/errors.js';

/**
 * Menghasilkan link "pintar" ke YouTube Studio yang menyertakan petunjuk akun.
 * @param {string} analysisId - ID dari VideoAnalysis.
 * @param {string} userId - ID User untuk validasi kepemilikan.
 * @returns {Promise<string>} URL ke YouTube Studio dengan parameter authuser.
 */
export const generateCommentLink = async (analysisId, userId) => {
  // Validasi kepemilikan (tetap sama dan sudah benar)
  const videoAnalysis = await VideoAnalysisRepository.findOne({
    _id: new mongoose.Types.ObjectId(analysisId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!videoAnalysis) {
    throw new NotFoundError('Data analisis tidak ditemukan atau Anda tidak memiliki akses.');
  }

  // UserRepository.findById mengembalikan query Mongoose, jadi bisa kita select
  const user = await UserRepository.findById(userId).select('email');
  if (!user) {
    throw new NotFoundError('Data pengguna tidak ditemukan.');
  }

  const { youtubeVideoId } = videoAnalysis;
  const userEmail = user.email;

  const studioUrl = `https://studio.youtube.com/video/${youtubeVideoId}/comments?authuser=${userEmail}`;

  console.log(`[StudioService] Generated smart link: ${studioUrl}`); // Log untuk debugging

  return studioUrl;
};
