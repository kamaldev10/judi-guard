// src/api/controllers/auth.controller.js
const config = require("../../config/environment");
const { createOAuth2Client } = require("../../utils/googleOAuth2Client");
const authService = require("../services/auth.service");

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

const handleLogin = async (req, res, next) => {
  try {
    const loginData = req.body;
    const { token, user } = await authService.loginUser(loginData);

    // Anda bisa mengirim token via httpOnly cookie jika diinginkan (lebih aman)
    // res.cookie('jwt', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // true jika HTTPS
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
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      // KIRIM ID USER JUDI GUARD SEBAGAI STATE
      state: req.user._id.toString(), // Pastikan _id user ada di req.user dan dikonversi ke string
    });

    res.redirect(authorizeUrl);
  } catch (error) {
    next(error);
  }
};

const handleGoogleOAuthCallback = async (req, res, next) => {
  try {
    const code = req.query.code; // Ambil 'code' dari query parameter
    // const state = req.query.state; // Ambil 'state' jika Anda mengirimkannya

    if (!code) {
      throw new BadRequestError("Kode otorisasi Google tidak ditemukan.");
    }

    // Anda perlu ID user Judi Guard yang login untuk menyimpan tokennya.
    // Jika Anda mengirim 'state' berisi req.user.id dari redirectToGoogleOAuth,
    // Anda bisa memverifikasinya di sini.
    // Untuk contoh ini, kita asumsikan session/JWT user Judi Guard masih valid
    // dan req.user sudah di-set oleh middleware isAuthenticated JIKA rute callback diproteksi.
    // Namun, callback dari Google tidak akan membawa header Authorization JWT kita.
    // Jadi, kita perlu cara lain untuk mengaitkan callback ini dengan user yang memulai.
    //
    // STRATEGI UMUM:
    // 1. Sebelum redirect ke Google, simpan sesuatu di session user (misal, state acak).
    // 2. Kirim state acak itu ke Google.
    // 3. Saat Google redirect kembali, bandingkan state dari Google dengan yang di session.
    // 4. Jika cocok, proses. User ID bisa diambil dari session.
    //
    // UNTUK SAAT INI, KITA AKAN ASUMSIKAN RUTE CALLBACK INI DIPANGGIL
    // SETELAH USER MELAKUKAN LOGIN DAN SEBELUMNYA SUDAH MELALUI `/youtube/connect`
    // DAN kita butuh cara untuk mendapatkan `judiGuardUserId` di sini.
    //
    // Salah satu cara (jika tidak menggunakan state yang kompleks atau session server-side):
    // Rute `/youtube/connect` harus `isAuthenticated`. `req.user.id` ada di sana.
    // Mungkin kita bisa meneruskan `req.user.id` ini ke `state` Google,
    // dan Google akan mengembalikannya.
    // Jika di `redirectToGoogleOAuth` kita set `state: req.user.id`, maka:
    // const judiGuardUserId = req.query.state;
    // Namun, `state` bisa di-tamper. Lebih baik `state` adalah nilai acak yang diverifikasi.
    //
    // Untuk V1 yang lebih simpel dan asumsi development di satu browser:
    // Kita akan memerlukan user login terlebih dahulu untuk mengakses endpoint `/youtube/connect`.
    // Saat ini, kita belum punya cara yang solid untuk mengidentifikasi user di callback
    // tanpa session server-side atau state yang lebih canggih.
    //
    // SOLUSI SEMENTARA (UNTUK TESTING LOKAL, KURANG AMAN UNTUK PRODUKSI TANPA STATE CHECK):
    // Asumsikan user terakhir yang mencoba connect adalah user yang sama.
    // Ini TIDAK AMAN. Kita akan perbaiki nanti atau menggunakan state.
    // Atau, kita bisa buat rute callback ini *juga* memerlukan autentikasi JWT Judi Guard,
    // TAPI Google tidak mengirimkan header itu. Jadi ini tidak bisa.
    //
    // Yang paling umum adalah menggunakan parameter 'state'.
    // Di redirectToGoogleOAuth:
    // const generatedState = crypto.randomBytes(16).toString('hex');
    // req.session.oauthState = generatedState; // Jika pakai session
    // authorizeUrl = oAuth2Client.generateAuthUrl({ ..., state: generatedState });
    // Di callback:
    // const receivedState = req.query.state;
    // if (receivedState !== req.session.oauthState) throw new Error('Invalid state');
    // const judiGuardUserId = req.session.userId;

    // KARENA KITA BELUM IMPLEMENTASI SESSION/STATE PENUH, kita akan coba ambil dari `req.user`
    // TAPI INGAT, INI HANYA AKAN BERFUNGSI JIKA RUTE CALLBACK JUGA DIPROTEKSI
    // DAN USER SUDAH MEMILIKI SESSION AKTIF DENGAN SERVER KITA SEBELUM GOOGLE REDIRECT.
    // Ini tidak akan terjadi karena Google redirect langsung ke sini tanpa header auth kita.
    //
    // CARA YANG BENAR: Gunakan `state` untuk membawa ID user Judi Guard (dienkripsi atau JWT pendek)
    // atau simpan mapping state ke user ID di server sementara.
    // Untuk V1 ini, mari kita modifikasi `redirectToGoogleOAuth` untuk menyertakan `req.user.id` dalam `state`.
    // Dan di callback, kita baca `state` tersebut sebagai `judiGuardUserId`.
    // Ini masih rentan jika state tidak dienkripsi/ditandatangani.

    const judiGuardUserId = req.query.state; // Asumsi state berisi user ID dari Judi Guard
    if (!judiGuardUserId) {
      // Jika state tidak ada (karena di redirectToGoogleOAuth tidak dikirim sebagai state)
      // Atau jika kita mau user login lagi untuk konfirmasi di callback ini
      // Ini adalah bagian yang tricky tanpa session management yang proper atau state yang aman.
      // Untuk V1 dan development, kita bisa sementara minta user sudah login ke Judi Guard
      // dan kita akan pakai `req.user.id` DARI `/youtube/connect` yang memanggil ini.
      // Namun, di callback INI, `req.user` TIDAK AKAN ADA karena ini request baru dari Google.
      //
      // *** PENTING: Ini perlu penanganan yang lebih baik untuk produksi ***
      // *** Untuk sekarang, kita harus meneruskan ID user dari `/connect` ke sini via `state` ***
      // Mari modifikasi redirectToGoogleOAuth untuk MENYERTAKAN `req.user.id` sebagai `state`
      // dan kemudian controller ini mengambilnya.

      // Jika `redirectToGoogleOAuth` diubah menjadi:
      // state: req.user.id, // Di dalam generateAuthUrl
      // Maka di sini:
      // const judiGuardUserId = req.query.state;
      // if (!judiGuardUserId) {
      //   return next(new BadRequestError('State parameter (user identifier) missing from Google OAuth callback.'));
      // }
      // Ini masih belum ideal dari sisi keamanan state, tapi fungsional untuk alur.
      throw new BadRequestError(
        "Parameter 'state' yang berisi ID pengguna Judi Guard tidak ditemukan. Proses OAuth tidak dapat dilanjutkan. Pastikan Anda memulai dari tombol 'Hubungkan Akun YouTube' setelah login ke Judi Guard."
      );
    }

    const result = await authService.handleYoutubeOAuthCallback(
      code,
      judiGuardUserId
    );

    // Redirect ke halaman frontend yang menandakan sukses/gagal
    // Misal: http://localhost:5173/youtube-link-success atau /youtube-link-failed
    // Anda bisa menambahkan query parameter jika perlu, misal ?message=sukses
    // res.redirect(`${config.frontendUrl}/profile?youtube_linked=true`); // Ganti config.frontendUrl
    res.status(200).json({
      status: "success",
      message: result.message,
      data: result.user, // Kirim data user yang sudah diupdate (tanpa token sensitif)
    });
  } catch (error) {
    // res.redirect(`${config.frontendUrl}/profile?youtube_linked=false&error=${encodeURIComponent(error.message)}`);
    next(error);
  }
};

module.exports = {
  handleRegister,
  handleLogin, // Tambahkan ini
  redirectToGoogleOAuth, // Tambahkan ini
  handleGoogleOAuthCallback, // Tambahkan ini
};
