// src/api/controllers/auth.controller.js
const { createOAuth2Client } = require("../../utils/googleOAuth2Client"); // Utilitas untuk OAuth2 client Google
const authService = require("../services/auth.service"); // Service untuk logika bisnis autentikasi
const { BadRequestError, UnauthorizedError } = require("../../utils/errors"); // Custom error classes
// const config = require("../../config/environment"); // Tidak terpakai di sini, bisa dihapus jika tidak untuk cookie

/**
 * Menangani registrasi pengguna baru.
 */
const handleRegister = async (req, res, next) => {
  try {
    const userData = req.body;
    // Memanggil service untuk mendaftarkan pengguna
    const newUser = await authService.registerUser(userData);
    res.status(201).json({
      status: "success",
      message:
        "Pengguna berhasil didaftarkan! Silakan login atau verifikasi OTP jika diperlukan.", // Sedikit penyesuaian pesan
      data: {
        user: newUser, // Mengembalikan data pengguna baru (tanpa field sensitif)
      },
    });
  } catch (error) {
    next(error); // Teruskan error ke global error handler
  }
};

/**
 * Menangani verifikasi OTP.
 */
const handleVerifyOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;
    // Memanggil service untuk verifikasi OTP
    const result = await authService.verifyOtp(email, otpCode);
    // Hasilnya bisa berisi token JWT dan data pengguna jika verifikasi berhasil dan langsung login
    res.status(200).json({
      status: "success",
      message: result.message, // Pesan dari service (misal "Verifikasi OTP berhasil.")
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Menangani permintaan pengiriman ulang OTP.
 */
const handleResendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Memanggil service untuk mengirim ulang OTP
    const result = await authService.resendOtp(email);
    res.status(200).json({
      status: "success",
      message: result.message, // Pesan dari service (misal "OTP baru telah dikirim.")
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Menangani login pengguna dengan email dan password.
 */
const handleLogin = async (req, res, next) => {
  try {
    const loginData = req.body;
    // Memanggil service untuk proses login
    const { token, user } = await authService.loginUser(loginData);

    // Opsi: Mengirim token via httpOnly cookie (jika Anda memilih pendekatan ini)
    // Perlu: import config from '../../config/environment';
    // const cookieOptions = {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   maxAge: parseInt(config.jwt.expiresInSeconds, 10) * 1000, // config.jwt.expiresInSeconds harus ada
    //   sameSite: 'Lax' // atau 'Strict' atau 'None' (jika cross-site dan secure)
    // };
    // res.cookie("jwtToken", token, cookieOptions);

    res.status(200).json({
      status: "success",
      message: "Login berhasil!",
      data: {
        token, // JWT untuk autentikasi sesi
        user, // Data pengguna (tanpa field sensitif)
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Menangani login atau registrasi pengguna menggunakan Google ID Token dari frontend.
 */
const handleGoogleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body; // ID Token Google yang diterima dari frontend
    if (!idToken) {
      throw new BadRequestError("Google ID Token diperlukan dari frontend.");
    }

    // Memanggil service untuk memproses otentikasi/registrasi Google
    const { token, user, isNewUser } = await authService.signInWithGoogle(
      idToken
    );

    const statusCode = isNewUser ? 201 : 200; // 201 jika user baru, 200 jika user lama
    const message = isNewUser
      ? "Pendaftaran dengan Google berhasil! Selamat datang."
      : "Login dengan Google berhasil!";

    res.status(statusCode).json({
      status: "success",
      message: message,
      data: { token, user }, // Token JWT aplikasi dan data pengguna
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mengarahkan pengguna ke halaman persetujuan OAuth Google untuk menghubungkan akun YouTube.
 * Frontend akan menerima URL redirect dari respons JSON ini.
 */
const redirectToGoogleOAuth = (req, res, next) => {
  try {
    // Pastikan req.user._id ada (dari middleware isAuthenticated)
    if (!req.user || !req.user._id) {
      return next(
        new UnauthorizedError(
          "Pengguna tidak teridentifikasi untuk memulai proses OAuth YouTube."
        )
      );
    }

    const oAuth2Client = createOAuth2Client(); // Membuat instance OAuth2 client
    const YOUTUBE_SCOPES = [
      // Perbaiki nama variabel jika ini khusus untuk YouTube
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      // "https://www.googleapis.com/auth/youtube.readonly", // Alternatif jika hanya perlu baca
      "https://www.googleapis.com/auth/youtube", // Akses lebih luas jika diperlukan (misal, hapus komentar)
    ];

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline", // Untuk mendapatkan refresh_token agar akses bisa diperpanjang
      scope: YOUTUBE_SCOPES.join(" "), // Scope harus string dipisahkan spasi
      state: req.user._id.toString(), // ID pengguna Judi Guard sebagai 'state' untuk verifikasi callback
      prompt: "consent", // Opsional: 'consent' akan selalu menampilkan layar persetujuan Google. Hapus untuk SSO jika sudah pernah setuju.
    });

    // Mengirim URL otorisasi ke frontend
    res.status(200).json({
      status: "success",
      message:
        "Silakan lanjutkan ke URL otorisasi Google untuk menghubungkan akun YouTube.",
      data: {
        redirectUrl: authorizeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Menangani callback dari Google OAuth setelah pengguna memberikan izin.
 * Menyimpan token YouTube dan mengarahkan pengguna kembali ke frontend.
 */
const handleGoogleOAuthCallback = async (req, res, next) => {
  const frontendProfileUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/profile` // Atau halaman spesifik untuk callback
    : "http://localhost:5173/profile"; // Fallback URL frontend

  try {
    const { code, state: judiGuardUserId, error: oauthError } = req.query;

    // Tangani jika pengguna menolak otorisasi atau ada error dari Google
    if (oauthError) {
      const errorMessage =
        oauthError === "access_denied"
          ? "Pengguna menolak permintaan izin YouTube."
          : `Error dari Google OAuth: ${oauthError}`;
      return res.redirect(
        `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
          errorMessage
        )}`
      );
    }

    if (!code) {
      return res.redirect(
        `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
          "Kode otorisasi Google tidak ditemukan."
        )}`
      );
    }

    if (!judiGuardUserId) {
      return res.redirect(
        `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
          "Parameter 'state' (ID pengguna Judi Guard) tidak ditemukan."
        )}`
      );
    }

    // Memanggil service untuk menukar kode dengan token dan menyimpan token YouTube
    const result = await authService.handleYoutubeOAuthCallback(
      code,
      judiGuardUserId
    );

    // Redirect ke frontend dengan status sukses
    res.redirect(
      `${frontendProfileUrl}?youtube_linked=true&message=${encodeURIComponent(
        result.message || "Akun YouTube berhasil terhubung."
      )}`
    );
  } catch (error) {
    // Menangkap error dari authService.handleYoutubeOAuthCallback
    console.error(
      "[Controller] Error di handleGoogleOAuthCallback:",
      error.message,
      error.stack
    );
    // Redirect ke frontend dengan pesan error
    res.redirect(
      `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
        error.message || "Terjadi kesalahan saat memproses otorisasi YouTube."
      )}`
    );
    // next(error) bisa dipanggil jika Anda ingin global error handler juga mencatatnya,
    // tapi pastikan tidak ada respons ganda (karena redirect sudah dilakukan).
  }
};

/**
 * Menangani pemutusan koneksi akun YouTube dari akun Judi Guard.
 */
const handleDisconnectYouTube = async (req, res, next) => {
  try {
    const userId = req.user._id; // req.user._id dari middleware isAuthenticated

    // Memanggil service untuk memutuskan koneksi akun YouTube
    const updatedUser = await authService.disconnectYouTubeAccount(userId);

    res.status(200).json({
      success: true, // Menggunakan 'success' agar konsisten dengan respons lain jika diinginkan
      message: "Akun YouTube berhasil diputuskan.",
      data: {
        user: updatedUser, // Mengembalikan data pengguna yang sudah diupdate (tanpa token YouTube)
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- Handler untuk Lupa, Reset, Ganti Password (sudah baik dari sebelumnya) ---
const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email wajib diisi dan harus berupa format yang valid.",
      });
    }
    const result = await authService.requestPasswordReset(email.trim());

    // Logging internal di server untuk membedakan kasus
    // (Switch statement dan console.log seperti sebelumnya sudah baik)
    // ... (switch statement untuk logging berdasarkan result.status) ...
    switch (result.status) {
      case "IS_GOOGLE_ONLY_ACCOUNT":
        console.info(
          `Forgot Password - Attempt for Google-only account: [${
            result.email || email
          }]`
        );
        break;
      case "RESET_EMAIL_SENT":
        console.info(`Password reset email initiated for: [${email}]`);
        break;
      case "USER_NOT_FOUND":
        console.info(`Forgot Password - User not found: [${email}]`);
        break;
      case "EMAIL_SEND_FAILED":
        console.error(
          `Forgot Password - Email send failed for [${email}]. Error:`,
          result.error?.message || result.error
        );
        break;
      case "UNKNOWN_USER_STATE":
        console.error(`Forgot Password - User in unknown state for [${email}]`);
        break;
      case "SERVICE_ERROR":
        console.error(
          `Forgot Password - Service error for [${email}]. Error:`,
          result.error?.message || result.error
        );
        const serviceError =
          result.error instanceof Error
            ? result.error
            : new Error(
                result.error?.message ||
                  "Terjadi kesalahan pada layanan reset password."
              );
        if (!serviceError.status) serviceError.status = 500;
        return next(serviceError);
      default:
        console.error(
          `Forgot Password - Unhandled service status for [${email}]: ${result.status}`
        );
        return next(new Error("Terjadi kesalahan tak terduga."));
    }

    // Respons generik untuk klien
    return res.status(200).json({
      success: true,
      message:
        "Jika alamat email Anda terdaftar di sistem kami dan terkait dengan kata sandi aplikasi, Anda akan menerima email berisi instruksi untuk mereset kata sandi Anda. Silakan periksa folder inbox dan spam Anda.",
    });
  } catch (error) {
    console.error(
      `Forgot Password - Controller level exception for [${req.body.email}]:`,
      error
    );
    return next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body; // Ambil juga confirmPassword jika divalidasi di service

    // Service processPasswordReset idealnya juga menerima confirmPassword jika ada validasi kecocokan di sana
    await authService.processPasswordReset(token, password, confirmPassword);

    res.status(200).json({
      success: true,
      message:
        "Kata sandi berhasil direset. Anda sekarang dapat login dengan kata sandi baru Anda.",
    });
  } catch (error) {
    next(error);
  }
};

const handleChangePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword, confirmPassword } = req.body; // Ambil confirmPassword juga

    // Service changeUserPassword idealnya juga menerima confirmPassword jika ada validasi kecocokan
    await authService.changeUserPassword(
      userId,
      currentPassword,
      newPassword,
      confirmPassword
    );

    res.status(200).json({
      success: true,
      message: "Password Anda berhasil diubah.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleRegister,
  handleVerifyOtp,
  handleResendOtp,
  handleLogin,
  handleGoogleAuth,
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback,
  handleDisconnectYouTube,
  handleForgotPassword,
  handleResetPassword,
  handleChangePassword,
};
