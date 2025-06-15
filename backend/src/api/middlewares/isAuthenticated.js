// src/api/middlewares/isAuthenticated.js
const { verifyToken } = require("../../utils/jwt");
const { UnauthorizedError, ForbiddenError } = require("../../utils/errors");
const User = require("../models/User.model"); // Opsional: jika ingin mengambil data user lengkap

const isAuthenticated = async (req, res, next) => {
  try {
    let token;
    // 1. Cek apakah token ada di Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Anda juga bisa menambahkan pengecekan token di cookies jika menggunakan cookie-based auth
    // else if (req.cookies.jwt) {
    //   token = req.cookies.jwt;
    // }

    if (!token) {
      return next(
        new UnauthorizedError(
          "Anda tidak login. Silakan login untuk mendapatkan akses."
        )
      );
    }

    // 2. Verifikasi token
    const decodedPayload = verifyToken(token);
    // console.log(
    //   `[AuthMiddleware] Token diterima. User ID dari token: ${decodedPayload.userId}`
    // ); // atau decoded._id

    if (!decodedPayload) {
      // Jika verifyToken mengembalikan null karena token tidak valid atau error lainnya
      return next(
        new ForbiddenError(
          "Token tidak valid atau kedaluwarsa. Silakan login kembali."
        )
      );
    }

    // 3. Cek apakah user yang terkait dengan token masih ada (opsional tapi direkomendasikan)
    // Kita akan mengambil user berdasarkan userId dari payload token.
    // Ini juga berguna untuk memastikan user tidak dihapus atau dinonaktifkan setelah token dibuat.
    const currentUser = await User.findById(decodedPayload.userId);
    if (!currentUser) {
      return next(
        new ForbiddenError(
          "Pengguna yang terkait dengan token ini sudah tidak ada."
        )
      );
    }

    // (Opsional) Cek apakah user mengubah password setelah token dibuat.
    // Ini memerlukan field 'passwordChangedAt' di User model.
    // if (currentUser.passwordChangedAfter(decodedPayload.iat)) { // iat: issued at time
    //   return next(
    //     new ForbiddenError('Password pengguna baru saja diubah. Silakan login kembali.')
    //   );
    // }

    // 4. Jika semua valid, tambahkan data user ke object request
    // Anda bisa memilih untuk hanya menyimpan ID, atau seluruh objek user (tanpa password).
    // Menyimpan seluruh objek user bisa berguna agar tidak perlu query DB lagi di controller.
    req.user = currentUser.toObject(); // Konversi ke plain object
    delete req.user.password; // Pastikan password tidak terbawa
    delete req.user.youtubeAccessToken; // Sembunyikan token sensitif
    delete req.user.youtubeRefreshToken;
    delete req.user.youtubeTokenExpiresAt;
    delete req.user.__v; // Hapus field __v dari Mongoose

    // Atau hanya menyimpan payload dari token jika tidak mau query DB di sini:
    // req.user = decodedPayload;

    next(); // Lanjutkan ke middleware atau handler berikutnya
  } catch (error) {
    // console.error("[AuthMiddleware] Terjadi error:", error.message);
    // Jika ada error tak terduga selama verifikasi token atau query user
    // (misalnya, error dari jwt.verify() selain yang sudah ditangani verifyToken)
    if (error.name === "JsonWebTokenError") {
      return next(new ForbiddenError("Token tidak valid."));
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new ForbiddenError("Token kedaluwarsa. Silakan login kembali.")
      );
    }
    next(error); // Teruskan ke global error handler
  }
};

module.exports = isAuthenticated;
