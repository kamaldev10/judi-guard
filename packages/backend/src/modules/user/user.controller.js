import { UserRepository } from './user.repository.js';
import * as youtubeService from '#shared/services/youtube.service.js';
import { NotFoundError, BadRequestError } from '#shared/utils/errors.js';

/**
 * Mengambil profil YouTube yang sedang terhubung.
 */
export const getYoutubeProfile = async (req, res, next) => {
  try {
    const tokens = req.youtubeTokens;
    const profile = await youtubeService.getChannelIdentity(tokens);

    res.status(200).json({
      status: 'success',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// ------------------------------------------------

/**
 * Mengambil data profil dari pengguna yang sedang login (Via DB).
 */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const userFromDb = await UserRepository.findByIdWithTokens(userId);

    if (!userFromDb) {
      throw new NotFoundError('Pengguna tidak ditemukan di database meskipun token valid.');
    }

    // Konversi ke objek JavaScript biasa untuk mengaktifkan virtuals.
    const userObject = userFromDb.toObject({ virtuals: true });

    // Hapus field sensitif dari objek yang akan dikirim ke frontend.
    delete userObject.password;
    delete userObject.youtubeAccessToken;
    delete userObject.youtubeRefreshToken;
    delete userObject.youtubeTokenExpiresAt;
    delete userObject.otpCode;
    delete userObject.otpExpiresAt;

    res.status(200).json({
      status: 'success',
      message: 'Data pengguna berhasil diambil.',
      data: {
        user: userObject,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Memperbarui data profil pengguna (misal: username, bio).
 * Mencegah pengguna mengubah field sensitif seperti email, role, atau password.
 */
export const updateMe = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Daftar field yang tidak boleh diubah melalui rute ini
    const forbiddenFields = [
      'email',
      'password',
      'role',
      'isVerified',
      '_id',
      'id',
      'createdAt',
      'updatedAt',
      'googleId',
      'youtubeChannelId',
      'youtubeChannelName',
      'youtubeAccessToken',
      'youtubeRefreshToken',
      'youtubeTokenExpiresAt',
    ];

    // Cek apakah ada upaya mengubah field terlarang
    for (const field of forbiddenFields) {
      if (req.body[field] !== undefined) {
        return next(new BadRequestError(`Field '${field}' tidak dapat diubah melalui rute ini.`));
      }
    }

    // Ambil hanya field yang diizinkan untuk diubah
    const allowedUpdates = {};
    const modifiableFields = ['username', 'bio', 'profilePicture'];

    modifiableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    });

    if (Object.keys(allowedUpdates).length === 0) {
      return next(new BadRequestError('Tidak ada data valid yang dikirim untuk diupdate.'));
    }

    const updatedUser = await UserRepository.updateById(userId, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(new NotFoundError('User tidak ditemukan untuk diupdate.'));
    }

    res.status(200).json({
      status: 'success',
      message: 'Profil berhasil diperbarui.',
      data: {
        user: updatedUser.toObject({ virtuals: true }),
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((el) => el.message);
      const message = `Data input tidak valid: ${messages.join('. ')}`;
      return next(new BadRequestError(message));
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      const message = `Nilai '${value}' untuk field '${field}' sudah digunakan. Silakan gunakan nilai lain.`;
      return next(new BadRequestError(message));
    }
    next(error);
  }
};

/**
 * Menangani penghapusan akun oleh pengguna itu sendiri (soft delete).
 * Mengubah status 'active' menjadi false.
 */
export const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await UserRepository.updateById(userId, { active: false }, { new: true });

    if (!user) {
      return next(new NotFoundError('User tidak ditemukan untuk dihapus.'));
    }

    res.status(200).json({
      status: 'success',
      message: 'Akun pengguna telah berhasil dinonaktifkan.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
