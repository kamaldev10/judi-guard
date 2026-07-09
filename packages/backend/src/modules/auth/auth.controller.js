import googleOAuth2Client from '#shared/clients/google-oauth2.client.js';
import * as authService from '#modules/auth/auth.service.js';
import youtubeService from '#shared/services/youtube.service.js';
import { BadRequestError, UnauthorizedError } from '#shared/utils/errors.js';
import config from '#config/environment.js';

const GUEST_CALLBACK_URL = `${config.apiUrl || 'http://localhost:3001'}/api/auth/guest/callback`;
const USER_CALLBACK_URL = `${config.apiUrl || 'http://localhost:3001'}/api/auth/youtube/callback`;

/**
 * Menangani registrasi pengguna baru.
 */
const handleRegister = async (req, res, next) => {
  try {
    const userData = req.body;
    // Memanggil service untuk mendaftarkan pengguna
    const newUser = await authService.registerUser(userData);
    res.status(201).json({
      status: 'success',
      message: 'Pengguna berhasil didaftarkan! Silahkan verifikasi OTP terlebih dahulu.',
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
      status: 'success',
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
      status: 'success',
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

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil!',
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
      throw new BadRequestError('Google ID Token diperlukan dari frontend.');
    }

    // Memanggil service untuk memproses otentikasi/registrasi Google
    const { token, user, isNewUser } = await authService.signInWithGoogle(idToken);

    const statusCode = isNewUser ? 201 : 200; // 201 jika user baru, 200 jika user lama
    const message = isNewUser
      ? 'Pendaftaran dengan Google berhasil! Selamat datang.'
      : 'Login dengan Google berhasil!';

    res.status(statusCode).json({
      status: 'success',
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
    if (!req.user || !req.user.id) {
      return next(new UnauthorizedError('User tidak teridentifikasi.'));
    }

    const YOUTUBE_SCOPES = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube',
    ];

    const client = googleOAuth2Client(USER_CALLBACK_URL);
    const authorizeUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: YOUTUBE_SCOPES,
      state: req.user.id.toString(), // Bawa ID user ke Google
      prompt: 'consent', // Paksa refresh token keluar
    });

    res.status(200).json({
      status: 'success',
      data: { redirectUrl: authorizeUrl },
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
  // URL Frontend (Ganti sesuai env Anda)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectBase = `${frontendUrl}/channel`; // Redirect ke halaman channel

  try {
    const { code, state: userId, error } = req.query;

    if (error) {
      return res.redirect(`${redirectBase}?status=error&msg=${encodeURIComponent(error)}`);
    }

    if (!code || !userId) {
      return res.redirect(`${redirectBase}?status=error&msg=InvalidCallbackParams`);
    }

    // Panggil Service untuk Simpan Token
    await authService.handleYoutubeOAuthCallback(code, userId);

    // Redirect Sukses
    res.redirect(`${redirectBase}?status=connected`);
  } catch (err) {
    console.error('Callback Error:', err);
    res.redirect(`${redirectBase}?status=error&msg=${encodeURIComponent(err.message)}`);
  }
};

/**
 * Menangani pemutusan koneksi akun YouTube dari akun Judi Guard.
 */
const handleDisconnectYouTube = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await authService.disconnectYouTubeAccount(userId);

    res.status(200).json({
      status: 'success',
      message: 'Akun YouTube berhasil diputuskan.',
    });
  } catch (error) {
    next(error);
  }
};

// --- GUEST MODE HANDLERS ---
/**
 * @desc    Redirect user ke Google untuk izin akses YouTube (Mode Tamu)
 * @route   GET /api/auth/guest/connect
 */
const handleConnectGuestYoutube = (req, res) => {
  const url = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline', // Wajib offline agar dapat Refresh Token
    scope: [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube',
    ],
    prompt: 'consent',
    include_granted_scopes: true,
    redirect_uri: GUEST_CALLBACK_URL, // PENTING: Harus beda/spesifik
  });

  res.status(200).json({
    status: 'success',
    data: {
      url: url,
    },
  });
};

/**
 * @desc    Callback dari Google untuk Mode Tamu
 * @route   GET /api/auth/guest/callback
 */
const handleConnectGuestCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=access_denied`);
    }

    // 1. Tukar Code dengan Tokens
    const { tokens } = await googleOAuth2Client.getToken({
      code,
      redirect_uri: GUEST_CALLBACK_URL, // Pastikan variabel ini sesuai kode Anda sebelumnya
    });

    // 2. OPTIMASI: Langsung ambil profil channel saat ini juga
    const channelProfile = await youtubeService.getChannelIdentity(tokens);

    // 3. Bungkus Token + Profil dalam satu objek Session
    const sessionData = {
      tokens: tokens,
      channel: channelProfile, // { id, title, thumbnail }
    };

    // 4. Simpan paket lengkap ini ke Cookie
    res.cookie('guest_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Hari
    });

    // Redirect dengan nama channel agar Frontend bisa langsung tahu
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?status=guest_connected&channel=${encodeURIComponent(channelProfile.title)}`,
    );
  } catch (error) {
    console.error('Guest Connect Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=connection_failed`);
  }
};

/**
 * @desc    menghapus koneksi YT di dsahboard
 * @route   POST /api/auth/guest/logout
 * @access  Public
 */
const handleGuestDisconnect = (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  // Hapus Cookie Utama
  res.clearCookie('guest_session', cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Berhasil memutuskan koneksi Youtube. Sesi telah dibersihkan.',
  });
};

// --- Handler untuk Lupa, Reset, Ganti Password (sudah baik dari sebelumnya) ---
const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi dan harus terdaftar serta dengan format yang valid.',
      });
    }
    const result = await authService.requestPasswordReset(email.trim());

    // Logging internal di server untuk membedakan kasus
    // (Switch statement dan console.log seperti sebelumnya sudah baik)
    // ... (switch statement untuk logging berdasarkan result.status) ...
    switch (result.status) {
      case 'IS_GOOGLE_ONLY_ACCOUNT':
        console.info(
          `Forgot Password - Attempt for Google-only account: [${result.email || email}]`,
        );
        break;
      case 'RESET_EMAIL_SENT':
        console.info(`Password reset email initiated for: [${email}]`);
        break;
      case 'USER_NOT_FOUND':
        console.info(`Forgot Password - User not found: [${email}]`);
        break;
      case 'EMAIL_SEND_FAILED':
        console.error(
          `Forgot Password - Email send failed for [${email}]. Error:`,
          result.error?.message || result.error,
        );
        break;
      case 'UNKNOWN_USER_STATE':
        console.error(`Forgot Password - User in unknown state for [${email}]`);
        break;
      case 'SERVICE_ERROR': {
        console.error(
          `Forgot Password - Service error for [${email}]. Error:`,
          result.error?.message || result.error,
        );
        const serviceError =
          result.error instanceof Error
            ? result.error
            : new Error(result.error?.message || 'Terjadi kesalahan pada layanan reset password.');
        if (!serviceError.status) serviceError.status = 500;
        return next(serviceError);
      }
      default:
        console.error(
          `Forgot Password - Unhandled service status for [${email}]: ${result.status}`,
        );
        return next(new Error('Terjadi kesalahan tak terduga.'));
    }

    // Respons generik untuk klien
    return res.status(200).json({
      success: true,
      message:
        'Jika alamat email Anda terdaftar di sistem kami dan terkait dengan kata sandi aplikasi, Anda akan menerima email berisi instruksi untuk mereset kata sandi Anda. Silakan periksa folder inbox dan spam Anda.',
    });
  } catch (error) {
    console.error(`Forgot Password - Controller level exception for [${req.body.email}]:`, error);
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
        'Kata sandi berhasil direset. Anda sekarang dapat login dengan kata sandi baru Anda.',
    });
  } catch (error) {
    next(error);
  }
};

const handleChangePassword = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    await authService.changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password Anda berhasil diubah.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  handleRegister,
  handleVerifyOtp,
  handleResendOtp,
  handleLogin,
  handleGoogleAuth,
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback,
  handleDisconnectYouTube,

  handleConnectGuestYoutube,
  handleConnectGuestCallback,
  handleGuestDisconnect,

  handleForgotPassword,
  handleResetPassword,
  handleChangePassword,
};
