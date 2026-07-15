import googleOAuth2Client from '#shared/clients/google-oauth2.client.js';
import * as authService from '#modules/auth/auth.service.js';
import * as otpService from '#modules/auth/otp.service.js';
import * as passwordService from '#modules/auth/password.service.js';
import * as youtubeOauthService from '#modules/auth/youtube-oauth.service.js';
import * as tokenService from '#modules/auth/token.service.js';
import { BadRequestError, UnauthorizedError } from '#shared/utils/errors.js';
import config from '#config/environment.js';

const USER_CALLBACK_URL = `${config.apiUrl || 'http://localhost:3001'}/api/auth/youtube/callback`;

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrasi pengguna baru
 *     description: Mendaftarkan user baru, mengirim OTP ke email untuk verifikasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: rahasia123
 *     responses:
 *       201:
 *         description: Registrasi berhasil, OTP dikirim
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { type: object }
 *       400:
 *         description: Validasi gagal
 *         $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Email/username sudah terdaftar
 *         $ref: '#/components/schemas/Error'
 */
const handleRegister = async (req, res, next) => {
  try {
    const userData = req.body;
    // Memanggil service untuk mendaftarkan pengguna
    const newUser = await otpService.registerUser(userData);
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
 * @openapi
 * /auth/verify-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verifikasi kode OTP
 *     description: Verifikasi email menggunakan kode OTP yang dikirim saat registrasi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otpCode]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               otpCode:
 *                 type: string
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: OTP valid, akun terverifikasi
 *       400:
 *         description: OTP salah/kedaluwarsa
 *         $ref: '#/components/schemas/Error'
 */
const handleVerifyOtp = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;
    // Memanggil service untuk verifikasi OTP
    const result = await otpService.verifyOtp(email, otpCode);

    // User dari Google — perlu set password
    if (result.status === 'set_password_required') {
      return res.status(200).json({
        status: 'set_password_required',
        message: result.message,
        data: { token: result.token },
      });
    }

    // User biasa — langsung login
    res.status(200).json({
      status: 'success',
      message: result.message,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /auth/resend-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Kirim ulang kode OTP
 *     description: Mengirim ulang kode OTP ke email user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP baru berhasil dikirim
 *       429:
 *         description: Terlalu banyak permintaan
 *         $ref: '#/components/schemas/Error'
 */
const handleResendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Memanggil service untuk mengirim ulang OTP
    const result = await otpService.resendOtp(email);
    res.status(200).json({
      status: 'success',
      message: result.message, // Pesan dari service (misal "OTP baru telah dikirim.")
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login pengguna
 *     description: Login menggunakan email dan password, mengembalikan JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: rahasia123
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user: { type: object }
 *       401:
 *         description: Email/password salah
 *         $ref: '#/components/schemas/Error'
 */
const handleLogin = async (req, res, next) => {
  try {
    const loginData = req.body;
    // Memanggil service untuk proses login
    const { accessToken, refreshToken, user } = await authService.loginUser(loginData);

    res.status(200).json({
      status: 'success',
      message: 'Login berhasil!',
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /auth/google/signin:
 *   post:
 *     tags: [Auth]
 *     summary: Login/Register dengan Google
 *     description: Autentikasi menggunakan Google ID Token dari frontend (Google Sign-In)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID Token dari client
 *     responses:
 *       200:
 *         description: Login Google berhasil
 *       201:
 *         description: Pendaftaran Google berhasil (user baru)
 *       400:
 *         description: ID Token tidak valid
 *         $ref: '#/components/schemas/Error'
 */
const handleSetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await otpService.setPasswordAfterOtp(
      email,
      password,
    );
    res.status(200).json({
      status: 'success',
      message: 'Password berhasil dibuat. Silakan login.',
      data: { accessToken, refreshToken, user },
    });
  } catch (error) {
    next(error);
  }
};

const handleGoogleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      throw new BadRequestError('Google ID Token diperlukan dari frontend.');
    }

    // Verifikasi Google ID token
    const result = await authService.signInWithGoogle(idToken);

    // User baru — create user + send OTP
    if (result.status === 'register_required') {
      const otpResult = await otpService.createGoogleUser(
        result.email,
        result.name,
        result.picture,
        result.googleId,
      );
      return res.status(200).json({
        status: 'otp_required',
        message: 'Silakan verifikasi email Anda dengan kode OTP yang telah dikirim.',
        data: { email: otpResult.email },
      });
    }

    // User existing — login biasa
    res.status(200).json({
      status: 'success',
      message: 'Login dengan Google berhasil!',
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /auth/youtube/connect:
 *   get:
 *     tags: [Auth]
 *     summary: Mulai koneksi YouTube OAuth
 *     description: Mengembalikan URL untuk redirect ke Google OAuth consent page
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: URL OAuth berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   type: object
 *                   properties:
 *                     redirectUrl: { type: string }
 *       401:
 *         description: Tidak terautentikasi
 */
const redirectToGoogleOAuth = (req, res, next) => {
  try {
    if (!req.auth || !req.auth.userId) {
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
      state: req.auth.userId.toString(), // Bawa ID user ke Google
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
 * @openapi
 * /auth/youtube/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Callback OAuth YouTube
 *     description: Menerima callback dari Google setelah user memberikan izin (redirect)
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code dari Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: User ID yang dikirim saat redirect
 *     responses:
 *       302:
 *         description: Redirect ke halaman frontend (channel)
 *       400:
 *         description: Parameter callback tidak valid
 */
const handleGoogleOAuthCallback = async (req, res, _next) => {
  // URL Frontend (Ganti sesuai env Anda)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectBase = `${frontendUrl}/dashboard`; // Redirect ke halaman dashboard

  try {
    const { code, state: userId, error } = req.query;

    if (error) {
      return res.redirect(`${redirectBase}?status=error&msg=${encodeURIComponent(error)}`);
    }

    if (!code || !userId) {
      return res.redirect(`${redirectBase}?status=error&msg=InvalidCallbackParams`);
    }

    // Panggil Service untuk Simpan Token
    await youtubeOauthService.handleYoutubeOAuthCallback(code, userId);

    // Redirect Sukses
    res.redirect(`${redirectBase}?status=connected`);
  } catch (err) {
    console.error('Callback Error:', err);
    res.redirect(`${redirectBase}?status=error&msg=${encodeURIComponent(err.message)}`);
  }
};

/**
 * @openapi
 * /auth/youtube/disconnect:
 *   post:
 *     tags: [Auth]
 *     summary: Putuskan koneksi YouTube
 *     description: Menghapus token YouTube dari database user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Koneksi YouTube berhasil diputuskan
 *       401:
 *         description: Tidak terautentikasi
 */
const handleDisconnectYouTube = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    await youtubeOauthService.disconnectYouTubeAccount(userId);

    res.status(200).json({
      status: 'success',
      message: 'Akun YouTube berhasil diputuskan.',
    });
  } catch (error) {
    next(error);
  }
};

// --- Handler untuk Lupa, Reset, Ganti Password ---

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Lupa password
 *     description: Mengirim email reset password ke alamat email user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Email reset password terkirim (jika email terdaftar)
 *       429:
 *         description: Terlalu banyak permintaan
 */
const handleForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi dan harus terdaftar serta dengan format yang valid.',
      });
    }
    const result = await passwordService.requestPasswordReset(email.trim());

    // Logging internal di server untuk membedakan kasus
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

/**
 * @openapi
 * /auth/reset-password/{token}:
 *   put:
 *     tags: [Auth]
 *     summary: Reset password dengan token
 *     description: Mereset password menggunakan token dari email reset password
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token reset password dari email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmPassword]
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: passwordBaru123
 *               confirmPassword:
 *                 type: string
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       400:
 *         description: Token tidak valid/kedaluwarsa
 *         $ref: '#/components/schemas/Error'
 */
const handleResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body; // Ambil juga confirmPassword jika divalidasi di service

    // Service processPasswordReset idealnya juga menerima confirmPassword jika ada validasi kecocokan di sana
    await passwordService.processPasswordReset(token, password, confirmPassword);

    res.status(200).json({
      success: true,
      message:
        'Kata sandi berhasil direset. Anda sekarang dapat login dengan kata sandi baru Anda.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /auth/change-password:
 *   patch:
 *     tags: [Auth]
 *     summary: Ganti password
 *     description: Mengganti password user yang sedang login
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: rahasia123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *       401:
 *         description: Password saat ini salah
 *         $ref: '#/components/schemas/Error'
 */
const handleChangePassword = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { currentPassword, newPassword } = req.body;

    await passwordService.changeUserPassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password Anda berhasil diubah.',
    });
  } catch (error) {
    next(error);
  }
};

const handleRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await tokenService.refreshAccessToken(refreshToken);
    res.status(200).json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    if (error.message === 'REFRESH_INVALID' || error.message === 'REFRESH_EXPIRED') {
      return next(new UnauthorizedError('Refresh token tidak valid. Silakan login ulang.'));
    }
    next(error);
  }
};

const handleLogout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await tokenService.blacklistAccessToken(req.auth);
    if (refreshToken) await tokenService.revokeRefreshToken(refreshToken);
    res.status(200).json({ status: 'success', message: 'Berhasil logout.' });
  } catch (error) {
    next(error);
  }
};

export {
  handleRegister,
  handleVerifyOtp,
  handleResendOtp,
  handleLogin,
  handleSetPassword,
  handleGoogleAuth,
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback,
  handleDisconnectYouTube,
  handleForgotPassword,
  handleResetPassword,
  handleChangePassword,
  handleRefreshToken,
  handleLogout,
};
