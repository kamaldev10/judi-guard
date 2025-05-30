// src/api/services/auth.service.js
const User = require("../../models/User.model");
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
} = require("../../utils/errors");
const { generateToken } = require("../../utils/jwt"); // Impor fungsi generateToken
const { createOAuth2Client } = require("../../utils/googleOAuth2Client"); // Impor
const { google } = require("googleapis"); // Impor google untuk youtube API client nanti

const registerUser = async (userData) => {
  // ... (kode registerUser yang sudah ada)
  const { username, email, password } = userData;

  // 1. Cek apakah email atau username sudah ada
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.email === email) {
      throw new BadRequestError(
        "Email sudah terdaftar. Silakan gunakan email lain."
      );
    }
    if (existingUser.username === username) {
      throw new BadRequestError(
        "Username sudah digunakan. Silakan pilih username lain."
      );
    }
  }

  // 2. Buat user baru (password akan di-hash oleh middleware pre-save di User.model)
  try {
    const newUser = await User.create({
      username,
      email,
      password,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return userResponse;
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      throw new BadRequestError(messages.join(", "));
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      throw new BadRequestError(
        `${field.charAt(0).toUpperCase() + field.slice(1)} sudah digunakan.`
      );
    }
    throw new AppError("Gagal mendaftarkan pengguna, silakan coba lagi.", 500);
  }
};

// TAMBAHKAN FUNGSI INI
const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // 1. Cari user berdasarkan email dan ambil passwordnya (karena select: false di model)
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new UnauthorizedError("Email atau password salah.");
  }

  // 2. Bandingkan password yang diberikan dengan password di database
  // Pastikan method comparePassword sudah ada di User.model.js dan bekerja dengan benar
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnauthorizedError("Email atau password salah.");
  }

  // 3. Jika password cocok, buat JWT
  const payload = {
    userId: user._id,
    username: user.username,
    // Anda bisa menambahkan role atau data lain jika perlu
  };
  const token = generateToken(payload);

  // 4. Persiapkan data user untuk respons (tanpa password)
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.youtubeAccessToken; // Sembunyikan token sensitif ini juga dari respons login umum
  delete userResponse.youtubeRefreshToken;
  delete userResponse.youtubeTokenExpiresAt;

  return { token, user: userResponse };
};

const handleYoutubeOAuthCallback = async (authCode, judiGuardUserId) => {
  try {
    const oAuth2Client = createOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(authCode); // Tukar code dengan tokens

    // Simpan tokens ke user
    // tokens berisi: access_token, refresh_token, expiry_date, scope, token_type
    // refresh_token hanya akan diberikan pada otorisasi pertama jika access_type: 'offline'

    const updateData = {
      youtubeAccessToken: tokens.access_token,
      // Simpan refresh_token hanya jika ada (Google hanya mengirimkannya sekali)
      ...(tokens.refresh_token && {
        youtubeRefreshToken: tokens.refresh_token,
      }),
      youtubeTokenExpiresAt: new Date(tokens.expiry_date),
    };

    // Opsional: Dapatkan info channel pengguna setelah mendapatkan token
    // Ini untuk menyimpan youtubeChannelId dan youtubeChannelName
    oAuth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: "v3", auth: oAuth2Client });
    try {
      const channelInfoResponse = await youtube.channels.list({
        mine: true, // Mendapatkan channel milik pengguna yang terautentikasi
        part: "id,snippet", // id dan snippet (untuk nama channel)
      });

      if (
        channelInfoResponse.data.items &&
        channelInfoResponse.data.items.length > 0
      ) {
        const channel = channelInfoResponse.data.items[0];
        updateData.youtubeChannelId = channel.id;
        updateData.youtubeChannelName = channel.snippet.title;
      }
    } catch (channelError) {
      console.error(
        "Gagal mendapatkan info channel YouTube setelah OAuth:",
        channelError.message
      );
      // Lanjutkan meskipun gagal mendapatkan info channel, token tetap disimpan
    }

    const updatedUser = await User.findByIdAndUpdate(
      judiGuardUserId,
      updateData,
      { new: true } // Kembalikan dokumen yang sudah diupdate
    ).select("-password"); // Jangan kembalikan password

    if (!updatedUser) {
      throw new AppError(
        "User Judi Guard tidak ditemukan untuk menyimpan token YouTube.",
        404
      );
    }

    // Jangan kembalikan token sensitif dalam respons ini
    const userResponse = updatedUser.toObject();
    delete userResponse.youtubeAccessToken;
    delete userResponse.youtubeRefreshToken;
    delete userResponse.youtubeTokenExpiresAt;

    return { message: "Akun YouTube berhasil terhubung!", user: userResponse };
  } catch (error) {
    console.error("Error selama callback YouTube OAuth:", error.message);
    // Error bisa dari oAuth2Client.getToken() atau saat update user
    // Periksa apakah error dari Google API atau dari aplikasi kita
    if (
      error.response &&
      error.response.data &&
      error.response.data.error_description
    ) {
      // Error dari Google
      throw new AppError(
        `Error dari Google: ${error.response.data.error_description}`,
        500
      );
    }
    throw new AppError(
      `Gagal menghubungkan akun YouTube: ${error.message}`,
      500
    );
  }
};

module.exports = {
  registerUser,
  loginUser, // Tambahkan ini
  handleYoutubeOAuthCallback,
};
