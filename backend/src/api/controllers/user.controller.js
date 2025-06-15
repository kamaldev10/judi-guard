// src/api/controllers/user.controller.js

const User = require("../models/User.model");
const { NotFoundError, BadRequestError } = require("../../utils/errors");

/**
 * Mengambil data profil dari pengguna yang sedang login.
 * Data diambil berdasarkan `req.user` yang sudah disiapkan oleh middleware `isAuthenticated`.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user._id berasal dari middleware isAuthenticated
    const userId = req.user._id;

    // console.log(
    //   `[Controller: getMe] Mengambil data untuk user ID: ${req.user._id}`
    // );

    // 1. Ambil pengguna dari DB dan secara eksplisit sertakan semua token YouTube.
    // Ini diperlukan agar virtual property 'isYoutubeConnected' bisa menghitung nilainya dengan benar.
    const userFromDb = await User.findById(userId).select(
      "+youtubeAccessToken +youtubeRefreshToken"
    );

    if (!userFromDb) {
      // Kondisi ini seharusnya tidak pernah tercapai jika middleware `isAuthenticated` bekerja,
      // karena middleware sudah memverifikasi bahwa user ada. Tapi ini pengaman yang bagus.
      throw new NotFoundError(
        "Pengguna tidak ditemukan di database meskipun token valid."
      );
    }

    // Konversi ke objek JavaScript biasa untuk mengaktifkan virtuals.
    const userObject = userFromDb.toObject({ virtuals: true });

    // Hapus field sensitif dari objek yang akan dikirim ke frontend.
    // Ini adalah lapisan keamanan tambahan yang sangat baik.
    delete userObject.password; // Meskipun select: false, lebih aman dihapus jika termuat.
    delete userObject.youtubeAccessToken;
    delete userObject.youtubeRefreshToken;
    delete userObject.youtubeTokenExpiresAt;
    delete userObject.otpCode;
    delete userObject.otpExpiresAt;

    res.status(200).json({
      status: "success",
      message: "Data pengguna berhasil diambil.",
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
const updateMe = async (req, res, next) => {
  try {
    const userId = req.user._id; // Gunakan _id agar konsisten dengan Mongoose

    // Daftar field yang tidak boleh diubah melalui rute ini
    const forbiddenFields = [
      "email",
      "password",
      "role",
      "isVerified",
      "_id",
      "id",
      "createdAt",
      "updatedAt",
      "googleId",
      "youtubeChannelId",
      "youtubeChannelName",
      "youtubeAccessToken",
      "youtubeRefreshToken",
      "youtubeTokenExpiresAt",
    ];

    // Cek apakah ada upaya mengubah field terlarang
    for (const field of forbiddenFields) {
      if (req.body[field] !== undefined) {
        // PERBAIKAN: Gunakan return agar eksekusi berhenti di sini
        return next(
          new BadRequestError(
            `Field '${field}' tidak dapat diubah melalui rute ini.`
          )
        );
      }
    }

    // Ambil hanya field yang diizinkan untuk diubah
    const allowedUpdates = {};
    const modifiableFields = ["username", "bio", "profilePicture"]; // Contoh field yang bisa diubah

    modifiableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        allowedUpdates[field] = req.body[field];
      }
    });

    if (Object.keys(allowedUpdates).length === 0) {
      return next(
        new BadRequestError("Tidak ada data valid yang dikirim untuk diupdate.")
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, allowedUpdates, {
      new: true, // Kembalikan dokumen yang sudah diupdate
      runValidators: true, // Jalankan validator skema saat update
    });
    // .select("-password"); // Tidak perlu select jika password sudah 'select: false' di skema

    if (!updatedUser) {
      // Seharusnya tidak terjadi jika user ID valid
      return next(new NotFoundError("User tidak ditemukan untuk diupdate."));
    }

    res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui.",
      data: {
        user: updatedUser.toObject({ virtuals: true }), // Kirim kembali sebagai objek plain dengan virtuals
      },
    });
  } catch (error) {
    // Penanganan error validasi dan duplikasi sudah baik
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((el) => el.message);
      const message = `Data input tidak valid: ${messages.join(". ")}`;
      return next(new BadRequestError(message));
    }
    if (error.code === 11000) {
      // Error duplikasi key (misal, username unique)
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
const deleteMe = async (req, res, next) => {
  try {
    const userId = req.user._id; // Gunakan _id agar konsisten

    // Di sini kita melakukan soft delete dengan mengubah field 'active'
    // Pastikan skema User Anda memiliki field `active: { type: Boolean, default: true }`
    const user = await User.findByIdAndUpdate(
      userId,
      { active: false }, // Contoh soft delete
      // Jika ingin hard delete: await User.findByIdAndDelete(userId);
      { new: true }
    );

    if (!user) {
      return next(new NotFoundError("User tidak ditemukan untuk dihapus."));
    }

    // Kirim respons sukses. Frontend harus menangani logout setelah ini.
    res.status(200).json({
      status: "success",
      message: "Akun pengguna telah berhasil dinonaktifkan.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateMe,
  deleteMe,
};
