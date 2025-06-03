// src/api/controllers/auth.controller.js
const { createOAuth2Client } = require("../../utils/googleOAuth2Client");
const authService = require("../services/auth.service");
const { UnauthorizedError } = require("../../utils/errors");

const handleRegister = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = await authService.registerUser(userData);
    res.status(201).json({
      status: "success",
      message: "Pengguna berhasil didaftarkan! Silakan login.",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleVerifyOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;
    const result = await authService.verifyOtp(email, otpCode);
    // Hasilnya berisi token dan user, mirip login sukses
    res.status(200).json({
      status: "success",
      message: result.message,
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleResendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendOtp(email);
    res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const handleLogin = async (req, res, next) => {
  try {
    const loginData = req.body;
    const { token, user } = await authService.loginUser(loginData);

    // Anda bisa mengirim token via httpOnly cookie jika diinginkan
    // res.cookie("jwt", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // true jika HTTPS
    //   maxAge: config.jwt.expiresIn, // samakan dengan expiry token atau atur sendiri
    // });

    res.status(200).json({
      status: "success",
      message: "Login berhasil!",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGoogleAppSignIn = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      throw new BadRequestError("Google ID Token diperlukan dari frontend.");
    }
    const { token, user, isNewUser } = await authService.signInWithGoogle(
      idToken
    );
    res.status(isNewUser ? 201 : 200).json({
      status: "success",
      message: isNewUser
        ? "Registrasi/Login dengan Google berhasil!"
        : "Login dengan Google berhasil!",
      data: { token, user },
    });
  } catch (error) {
    next(error);
  }
};

const redirectToGoogleOAuth = (req, res, next) => {
  try {
    // Pastikan req.user ada karena rute ini diproteksi isAuthenticated
    if (!req.user || !req.user._id) {
      // _id adalah properti default dari Mongoose

      return next(
        new UnauthorizedError(
          "User tidak teridentifikasi untuk memulai proses OAuth."
        )
      );
    }

    const oAuth2Client = createOAuth2Client();
    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly", // Lebih spesifik untuk membaca channel info
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      // "https://www.googleapis.com/auth/youtube.force-ssl",
    ];

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes.join(" "), // Scope harus string dipisah spasi
      state: req.user._id.toString(), // ID pengguna Judi Guard sebagai state
      prompt: "consent", // Opsional: tambahkan ini jika ingin selalu munculkan layar izin saat development
    });

    // const responsePayload = {
    //   status: "success",
    //   message: "Silakan lanjutkan ke URL otorisasi Google.",
    //   data: {
    //     // Pastikan ada object 'data' yang membungkus redirectUrl
    //     redirectUrl: authorizeUrl,
    //   },
    // };

    // console.log("========================================================");
    // console.log(
    //   "BACKEND /auth/youtube/connect MENGIRIM PAYLOAD:",
    //   JSON.stringify(responsePayload, null, 2)
    // );
    // console.log("========================================================");

    res.status(200).json({
      status: "success",
      message: "Silakan lanjutkan ke URL otorisasi Google.",
      data: {
        redirectUrl: authorizeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleGoogleOAuthCallback = async (req, res, next) => {
  // Ambil FRONTEND_URL dari environment variable, dengan fallback jika tidak ada
  const frontendProfileUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/profile`
    : "http://localhost:5173/profile";
  // GANTI 'http://localhost:5173' dengan URL default frontend Anda jika berbeda

  try {
    const code = req.query.code;
    const judiGuardUserId = req.query.state;

    if (!code) {
      // Langsung redirect ke frontend dengan error jika tidak ada code
      return res.redirect(
        `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
          "Kode otorisasi Google tidak ditemukan."
        )}` // <--- PERBAIKAN DI SINI
      );
    }
    if (!judiGuardUserId) {
      // Langsung redirect ke frontend dengan error jika tidak ada state
      return res.redirect(
        `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
          "Parameter 'state' (ID pengguna Judi Guard) tidak ditemukan."
        )}` // <--- PERBAIKAN DI SINI
      );
    }

    const result = await authService.handleYoutubeOAuthCallback(
      code,
      judiGuardUserId
    );

    // Jika service berhasil dan mengembalikan 'result.message'
    res.redirect(
      `${frontendProfileUrl}?youtube_linked=true&message=${encodeURIComponent(
        result.message || "Akun YouTube berhasil terhubung."
      )}`
    );
  } catch (error) {
    console.error(
      "Error di handleGoogleOAuthCallback (controller):",
      error.message
    ); // Log error di backend
    // Redirect ke frontend dengan pesan error dari exception
    res.redirect(
      `${frontendProfileUrl}?youtube_linked=false&error=${encodeURIComponent(
        error.message || "Terjadi kesalahan saat memproses otorisasi YouTube."
      )}`
    );
    // Anda bisa memilih untuk tidak memanggil next(error) di sini jika redirect sudah cukup
    // dan error handler global   Anda tidak mencoba mengirim respons lagi.
    // Jika error handler global hanya untuk logging, next(error) tidak masalah.
  }
};

const handleDisconnectYouTube = async (req, res, next) => {
  try {
    // req.user.id harusnya sudah ada dari middleware otentikasi
    const userId = req.user.id;
    if (!userId) {
      // Ini seharusnya tidak terjadi jika rute diproteksi dengan benar
      return next(
        new UnauthorizedError("Akses ditolak. Pengguna tidak terautentikasi.")
      );
    }

    const updatedUser = await authService.disconnectYouTubeAccount(userId);

    res.status(200).json({
      success: true, // Sesuai dengan ekspektasi frontend Anda
      message: "Akun YouTube berhasil diputuskan.",
      data: {
        user: updatedUser, // Kirim user yang sudah diupdate
      },
    });
  } catch (error) {
    next(error);
  }
};

const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body; // Email diambil dari body request
    await authService.requestPasswordReset(email);

    // Respons sukses selalu generik untuk keamanan (mencegah user enumeration)
    res.status(200).json({
      success: true,
      message:
        "Jika alamat email Anda terdaftar di sistem kami, Anda akan menerima email berisi instruksi untuk mereset kata sandi Anda.",
      // Tidak ada data spesifik pengguna yang dikembalikan di sini
    });
  } catch (error) {
    // Jika authService.requestPasswordReset melempar error (misalnya, gagal kirim email),
    // error akan diteruskan ke middleware errorHandler global Anda.
    // errorHandler Anda yang akan mengirim respons error JSON, contoh:
    // res.status(500).json({ success: false, message: 'Gagal mengirim email instruksi.' });
    next(error);
  }
};

const handleResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params; // Token diambil dari parameter URL
    const { password } = req.body; // Password baru diambil dari body request

    await authService.processPasswordReset(token, password);

    res.status(200).json({
      success: true,
      message:
        "Kata sandi berhasil direset. Anda sekarang dapat login dengan kata sandi baru Anda.",
      // Tidak ada data spesifik pengguna yang dikembalikan di sini
    });
  } catch (error) {
    // Jika authService.processPasswordReset melempar error (token tidak valid, dll.),
    // error akan diteruskan ke middleware errorHandler global Anda.
    // errorHandler Anda yang akan mengirim respons error JSON, contoh:
    // res.status(400).json({ success: false, message: 'Token reset tidak valid atau sudah kedaluwarsa.' });
    next(error);
  }
};

const handleChangePassword = async (req, res, next) => {
  try {
    const userId = req.user._id; // Diambil dari middleware isAuthenticated
    const { currentPassword, newPassword } = req.body;

    await authService.changeUserPassword(userId, currentPassword, newPassword);

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

  handleGoogleAppSignIn,
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback,
  handleDisconnectYouTube, // Tambahkan ini

  handleForgotPassword,
  handleResetPassword,
  handleChangePassword,
};
