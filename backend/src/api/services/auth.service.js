// src/api/services/auth.service.js
const User = require("../../models/User.model");
const {
  AppError,
  BadRequestError,
  UnauthorizedError,
} = require("../../utils/errors");
const { generateToken, generateRandomToken } = require("../../utils/jwt"); // Impor fungsi generateToken
const { createOAuth2Client } = require("../../utils/googleOAuth2Client"); // Impor
const { google } = require("googleapis"); // Impor google untuk youtube API client nanti
const sendEmail = require("../../utils/emailSender"); // Impor pengirim email
const crypto = require("crypto"); // Modul bawaan Node.js untuk generate string acak
const config = require("../../config/environment");
const { OAuth2Client } = require("google-auth-library"); // Penting untuk verifikasi ID Token
const { PasswordReset } = require("../../models/PasswordReset.model");

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const registerUser = async (userData) => {
  const { username, email, password } = userData;

  let existingUser = await User.findOne({ email }); // Hanya cek email untuk OTP flow
  if (existingUser && existingUser.isVerified) {
    throw new BadRequestError(
      "Email sudah terdaftar dan terverifikasi. Silakan login."
    );
  }
  if (existingUser && !existingUser.isVerified) {
    // User sudah ada tapi belum verifikasi, kita bisa kirim ulang OTP atau minta mereka verifikasi
    // Untuk V1, kita akan update OTP dan kirim ulang.
    console.log(
      `Email ${email} sudah terdaftar tapi belum diverifikasi. Mengupdate OTP.`
    );
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP berlaku 10 menit

  let userToSave;
  if (existingUser && !existingUser.isVerified) {
    // User sudah ada, update OTP-nya
    existingUser.otpCode = otp;
    existingUser.otpExpiresAt = otpExpiresAt;
    // Password tidak diubah di sini kecuali ada logika khusus
    // Username juga tidak diubah
    userToSave = existingUser;
  } else {
    // User baru, buat entri baru
    // Cek username jika user baru (karena username unik)
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new BadRequestError(
        "Username sudah digunakan. Silakan pilih username lain."
      );
    }
    userToSave = new User({
      username,
      email,
      password, // Akan di-hash oleh pre-save hook
      otpCode: otp,
      otpExpiresAt,
      isVerified: false, // Defaultnya false
    });
  }

  try {
    await userToSave.save();

    // Kirim email OTP
    const emailOptions = {
      email: userToSave.email,
      subject: "Kode Verifikasi OTP Judi Guard Anda",
      text: `Halo ${userToSave.username},\n\nKode OTP Anda adalah: ${otp}\nKode ini berlaku selama 10 menit.\n\nJika Anda tidak meminta kode ini, abaikan email ini.\n\nTerima kasih,\nTim Judi Guard`,
      // html: `<p>...</p>` // Anda bisa membuat template HTML yang lebih bagus
    };

    const emailResult = await sendEmail(emailOptions);
    if (!emailResult.success) {
      console.error(
        "Gagal mengirim email OTP setelah registrasi:",
        emailResult.error
      );
      // Anda mungkin ingin menangani ini (misalnya, memberitahu user untuk coba lagi nanti)
      // Untuk sekarang, proses registrasi (penyimpanan user) tetap dianggap berhasil
      // tapi user tidak akan dapat OTP. Ini perlu perhatian lebih.
      // throw new AppError('User berhasil dibuat, tapi gagal mengirim OTP. Hubungi support.', 500);
    }
    if (emailResult.previewUrl) {
      console.log(
        `Email OTP dikirim (Ethereal). Preview: ${emailResult.previewUrl}`
      );
    }

    // Jangan kirim password atau OTP kembali ke client
    const userResponse = userToSave.toObject();
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.otpExpiresAt;
    // JWT TIDAK DIBERIKAN DI SINI, user harus verifikasi OTP dulu

    return {
      message: `Registrasi berhasil. Kode OTP telah dikirim ke ${userToSave.email}. Silakan cek email Anda.`,
      user: userResponse, // Kirim data user dasar (tanpa token)
    };
  } catch (error) {
    // ... (penanganan error yang sudah ada, pastikan tidak ada JWT yang dikirim)
    if (error.name === "ValidationError") {
      /* ... */
    }
    if (error.code === 11000) {
      /* ... */
    }
    throw new AppError(`Gagal mendaftarkan pengguna: ${error.message}`, 500);
  }
};

const verifyOtp = async (email, otpCode) => {
  if (!email || !otpCode) {
    throw new BadRequestError("Email dan kode OTP diperlukan.");
  }

  const user = await User.findOne({ email }).select("+otpCode +otpExpiresAt"); // Ambil field OTP
  if (!user) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }
  if (user.isVerified) {
    throw new BadRequestError("Akun ini sudah diverifikasi sebelumnya.");
  }
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new BadRequestError(
      "Tidak ada OTP yang tertunda untuk akun ini. Silakan daftar atau minta OTP baru."
    );
  }
  if (user.otpCode !== otpCode) {
    throw new BadRequestError("Kode OTP salah.");
  }
  if (new Date() > user.otpExpiresAt) {
    // OTP sudah kedaluwarsa, bersihkan
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    throw new BadRequestError(
      "Kode OTP sudah kedaluwarsa. Silakan minta OTP baru."
    );
  }

  // OTP valid
  user.isVerified = true;
  user.otpCode = undefined; // Hapus OTP setelah digunakan
  user.otpExpiresAt = undefined;
  await user.save();

  // Generate JWT Judi Guard untuk user
  const judiGuardTokenPayload = { userId: user._id, username: user.username };
  const token = generateToken(judiGuardTokenPayload);

  const userResponse = user.toObject();
  delete userResponse.password;
  // Hapus field OTP yang sudah tidak relevan
  delete userResponse.otpCode;
  delete userResponse.otpExpiresAt;

  return {
    message: "Verifikasi OTP berhasil! Anda sekarang login.",
    token,
    user: userResponse,
  };
};

const resendOtp = async (email) => {
  if (!email) {
    throw new BadRequestError("Email diperlukan untuk mengirim ulang OTP.");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError("Pengguna dengan email ini tidak ditemukan.");
  }
  if (user.isVerified) {
    throw new BadRequestError("Akun ini sudah diverifikasi.");
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP baru berlaku 10 menit

  user.otpCode = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  // Kirim email OTP
  const emailOptions = {
    email: user.email,
    subject: "Kode Verifikasi OTP Judi Guard Anda (Kirim Ulang)",
    text: `Halo ${user.username},\n\nKode OTP baru Anda adalah: ${otp}\nKode ini berlaku selama 10 menit.\n\nTerima kasih,\nTim Judi Guard`,
  };

  const emailResult = await sendEmail(emailOptions);
  if (!emailResult.success) {
    console.error("Gagal mengirim ulang email OTP:", emailResult.error);
    // throw new AppError('Gagal mengirim ulang OTP. Hubungi support.', 500);
  }
  if (emailResult.previewUrl) {
    console.log(
      `Email OTP (kirim ulang) dikirim. Preview: ${emailResult.previewUrl}`
    );
  }

  return { message: `Kode OTP baru telah dikirim ke ${user.email}.` };
};

// TAMBAHKAN FUNGSI INI
const loginUser = async (userData) => {
  const { email, password } = userData;

  // 1. Cari user berdasarkan email dan ambil passwordnya (karena select: false di model)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Akun belum terdaftar.");
  }

  // 2. Bandingkan password yang diberikan dengan password di database
  // Pastikan method comparePassword sudah ada di User.model.js dan bekerja dengan benar
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnauthorizedError("Password anda salah.");
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

  console.log(userResponse);
  return { token, user: userResponse };
};

const signInWithGoogle = async (idTokenString) => {
  if (!config.googleSignIn || !config.googleSignIn.clientId) {
    console.error(
      "Konfigurasi Google Sign-In Client ID di backend belum lengkap."
    );
    throw new AppError(
      "Konfigurasi Google Sign-In Client ID di backend belum lengkap.",
      500
    );
  }
  const googleIdTokenVerifierClient = new OAuth2Client(
    config.googleSignIn.clientId
  );

  try {
    const ticket = await googleIdTokenVerifierClient.verifyIdToken({
      idToken: idTokenString,
      audience: config.googleSignIn.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new UnauthorizedError(
        "Google ID Token tidak valid atau informasi tidak lengkap."
      );
    }

    if (!payload.email_verified) {
      console.warn(
        `Percobaan masuk dengan email Google yang belum terverifikasi: ${payload.email}`
      );
    }

    const googleId = payload.sub;
    const email = payload.email;
    const nameFromGoogle = payload.name || email.split("@")[0];
    const picture = payload.picture;

    let user = await User.findOne({
      $or: [{ googleId: googleId }, { email: email }],
    });

    let isNewUser = false; // Flag untuk menandai apakah pengguna ini baru atau tidak

    //---------------skenario login dan register---------------//
    // Jika user TIDAK ditemukan di database (berdasarkan googleId ATAU email) => buat pengguna baru
    if (!user) {
      isNewUser = true; // Set flag menjadi true, artinya ini pendaftaran baru
      let username = nameFromGoogle.replace(/\s+/g, "").toLowerCase();
      let count = 0;
      let tempUsername = username;
      while (await User.findOne({ username: tempUsername })) {
        count++;
        tempUsername = `${username}${count}`;
      }
      username = tempUsername;

      user = await User.create({
        googleId: googleId,
        email: email,
        username: username,
        isVerified: payload.email_verified || true,
        fullName: nameFromGoogle,
        profilePictureUrl: picture,
      });
    } else {
      // Jika user DITEMUKAN di database ==> ... logika untuk memperbarui pengguna yang sudah ada
      if (!user.googleId) user.googleId = googleId;
      if (!user.isVerified && payload.email_verified) user.isVerified = true;
      user.fullName = nameFromGoogle;
      user.profilePictureUrl = picture;
      await user.save();
    }
    //---------------end skenario login dan register---------------//

    const appTokenPayload = { userId: user._id, username: user.username };
    const token = generateToken(appTokenPayload);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.googleId;

    return { token, user: userResponse, isNewUser };
  } catch (error) {
    console.error("Error saat sign in with Google (util):", error.message);
    if (
      error.message.includes("Token used too late") ||
      error.message.includes("Invalid token signature")
    ) {
      throw new UnauthorizedError(
        "Sesi Google tidak valid atau kedaluwarsa. Silakan coba lagi."
      );
    }
    if (error instanceof AppError || error instanceof UnauthorizedError)
      throw error;
    throw new AppError(
      `Gagal autentikasi dengan Google: ${error.message}`,
      500
    );
  }
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

/**
 * Memutuskan koneksi akun YouTube untuk pengguna.
 * @param {string} userId - ID pengguna yang akan diputuskan koneksi YouTube-nya.
 * @returns {Promise<object>} Objek pengguna yang telah diperbarui (tanpa field sensitif).
 */
const disconnectYouTubeAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  // Jika tidak ada koneksi YouTube, tidak ada yang perlu dilakukan (atau bisa beri pesan)
  if (!user.youtubeAccessToken && !user.youtubeChannelId) {
    // Anda bisa memilih untuk melempar error atau mengembalikan pesan bahwa tidak ada yang diputuskan
    // throw new AppError("Akun YouTube tidak terhubung dengan pengguna ini.", 400);
    // Atau cukup kembalikan user apa adanya dengan pesan sukses yang berbeda nanti di controller
    console.log(
      `[AuthService] Pengguna ${userId} mencoba disconnect YouTube, tapi memang belum terhubung.`
    );
  }

  // Hapus field-field terkait YouTube
  user.youtubeAccessToken = undefined;
  user.youtubeRefreshToken = undefined;
  user.youtubeTokenExpiresAt = undefined;
  user.youtubeChannelId = undefined;
  user.youtubeChannelName = undefined;
  user.youtubeChannelThumbnailUrl = undefined; // Jika Anda menyimpan ini juga

  await user.save();

  // Kembalikan objek pengguna yang sudah bersih dan diperbarui
  const userToReturn = user.toObject({ virtuals: true });
  delete userToReturn.password;
  delete userToReturn.otpCode;
  delete userToReturn.otpExpiresAt;
  delete userToReturn.youtubeAccessToken; // Pastikan semua token sensitif dihapus dari respons
  delete userToReturn.youtubeRefreshToken;
  delete userToReturn.youtubeTokenExpiresAt;
  // googleId juga bisa dihapus jika tidak relevan untuk respons ini
  // delete userToReturn.googleId;

  return userToReturn; // Mengembalikan user yang sudah diupdate
};

/**
 * Memproses permintaan reset password.
 * Mengembalikan objek status yang menunjukkan hasil operasi.
 *
 * @param {string} emailAddress - Alamat email pengguna yang meminta reset.
 * @returns {Promise<object>} Objek status seperti { status: 'STATUS_CODE', ...dataLain }
 * Kemungkinan status:
 * - 'USER_NOT_FOUND'
 * - 'IS_GOOGLE_ONLY_ACCOUNT' (jika pengguna hanya login via Google)
 * - 'RESET_EMAIL_SENT' (jika email instruksi berhasil dikirim)
 * - 'EMAIL_SEND_FAILED' (jika pengiriman email gagal)
 * - 'UNKNOWN_USER_STATE' (jika kondisi user tidak terduga)
 */
const requestPasswordReset = async (emailAddress) => {
  try {
    const user = await User.findOne({ email: emailAddress.toLowerCase() }) // ATAU .select('+password') jika sudah diperbaiki
      .select("+password +googleId");

    if (!user) {
      return { status: "USER_NOT_FOUND" };
    }

    // Periksa apakah pengguna adalah pengguna Google murni (punya googleId tapi tidak punya password lokal)
    if (user.googleId && !user.password) {
      return { status: "IS_GOOGLE_ONLY_ACCOUNT", email: user.email };
    }

    // Jika pengguna ada dan punya password lokal (user.password ada nilainya)
    if (user.password) {
      // Hapus token reset password lama untuk pengguna ini (jika ada)
      await PasswordReset.deleteMany({ userId: user._id });

      // Buat token reset baru
      const resetToken = generateRandomToken(); // Asumsi ini menghasilkan token string
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Token berlaku 15 menit

      // Simpan token reset ke database

      await PasswordReset.create({
        userId: user._id,
        token: resetToken,
        expiresAt,
      });

      // Siapkan URL reset untuk frontend
      const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`; // Pastikan rute frontend benar

      // Konten email (gunakan teks biasa atau HTML)
      // Sesuaikan nama aplikasi dan detail lainnya
      const emailSubject = "Instruksi Reset Kata Sandi Akun Anda";
      const emailText = `
          Halo ${user.username || "Pengguna"},

          Anda (atau seseorang) telah meminta untuk mereset kata sandi untuk akun Anda di ${
            config.appName || "Judi Guard Application"
          }.
          Jika ini adalah Anda, silakan klik tautan di bawah ini untuk melanjutkan:
          ${resetUrl}

          Tautan ini akan kedaluwarsa dalam 15 menit.

          Jika Anda tidak meminta reset kata sandi ini, Anda bisa mengabaikan email ini dengan aman.

          Terima kasih,
          Tim ${config.appName || "Judi Guard Application"}
      `.trim();

      // Kirim email
      try {
        const emailResult = await sendEmail({
          email: user.email,
          subject: emailSubject,
          text: emailText,
          // html: "<h1>Versi HTML jika ada</h1><p>" + emailText.replace(/\n/g, "<br>") + "</p>" // Opsional
        });

        if (emailResult && emailResult.success) {
          if (emailResult.previewUrl) {
            // Jika menggunakan Ethereal untuk development
            console.log(
              `Password reset email preview URL (Ethereal): ${emailResult.previewUrl}`
            );
          }
          console.info(
            `Password reset email sent successfully to: ${user.email}`
          );
          return { status: "RESET_EMAIL_SENT" };
        } else {
          // Jika sendEmail mengembalikan { success: false, error: ... }
          console.error(
            `Failed to send password reset email (reported by emailSender) to ${user.email}:`,
            emailResult ? emailResult.error : "Unknown email sending error"
          );
          // Hapus token yang baru dibuat karena email gagal terkirim
          await PasswordReset.deleteOne({
            token: resetToken,
            userId: user._id,
          });
          return {
            status: "EMAIL_SEND_FAILED",
            error: emailResult
              ? emailResult.error
              : new Error("Unknown email sending error"),
          };
        }
      } catch (error) {
        // Error saat memanggil sendEmail itu sendiri
        console.error(
          `Critical error during sendEmail call for password reset to ${user.email}:`,
          error
        );
        // Hapus token yang baru dibuat karena email gagal terkirim
        await PasswordReset.deleteOne({ token: resetToken, userId: user._id });
        return { status: "EMAIL_SEND_FAILED", error };
      }
    }

    // Jika sampai sini, berarti user ada tapi tidak punya googleId maupun password.
    // Ini kondisi yang aneh dan seharusnya tidak terjadi jika data user konsisten.
    console.error(
      `Password reset attempt for user in unknown state (no password, no googleId): ${emailAddress}`
    );
    return { status: "UNKNOWN_USER_STATE" };
  } catch (error) {
    // Tangani error sistem/database yang lebih umum di sini
    console.error(
      `System error in requestPasswordReset for email ${emailAddress}:`,
      error
    );

    return { status: "SERVICE_ERROR", error };
  }
};

const processPasswordReset = async (plainTokenFromURL, newPassword) => {
  const hashedTokenToSearch = crypto
    .createHash("sha256")
    .update(plainTokenFromURL)
    .digest("hex");
  const passwordResetEntry = await PasswordReset.findOne({
    token: hashedTokenToSearch,
  });

  if (!passwordResetEntry) {
    throw new BadRequestError(
      "Token reset tidak valid atau sudah kedaluwarsa."
    );
  }

  if (passwordResetEntry.expiresAt < new Date()) {
    throw new BadRequestError(
      "Token reset sudah kedaluwarsa. Silakan minta reset kata sandi lagi."
    );
  }

  const user = await User.findById(passwordResetEntry.userId);
  if (!user) {
    await PasswordReset.findByIdAndDelete(passwordResetEntry._id);
    throw new NotFoundError(
      "Pengguna yang terkait dengan token ini tidak ditemukan."
    );
  }

  user.password = newPassword;
  await user.save();

  await PasswordReset.findByIdAndDelete(passwordResetEntry._id);

  // Email konfirmasi perubahan password (teks biasa)
  const confirmationText = `
Halo ${user.username || "Pengguna"},

Kata sandi untuk akun JudiGuard Anda (${
    user.email
  }) telah berhasil diubah pada ${new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
  })}.

Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda dan hubungi tim support kami.

Terima kasih,
Tim JudiGuard
  `.trim();

  try {
    const emailConfirmationResult = await sendEmail({
      email: user.email,
      subject: "Konfirmasi Perubahan Kata Sandi Akun JudiGuard",
      text: confirmationText, // Hanya mengirimkan teks
      // html: null, // atau hapus properti html
    });

    if (!emailConfirmationResult.success) {
      console.warn(
        "Failed to send password change confirmation email (reported by emailSender):",
        emailConfirmationResult.error
      );
    }
    if (emailConfirmationResult.previewUrl) {
      console.log(
        `Ethereal preview URL for password confirmation: ${emailConfirmationResult.previewUrl}`
      );
    }
  } catch (emailError) {
    console.error(
      "Error during sendEmail call for password change confirmation:",
      emailError
    );
  }
};

const changeUserPassword = async (userId, currentPassword, newPassword) => {
  // Ambil user DENGAN password-nya untuk perbandingan
  const user = await User.findById(userId).select("+password");

  if (!user) {
    // Seharusnya tidak terjadi jika user diambil dari req.user (hasil isAuthenticated)
    throw new NotFoundError("Pengguna tidak ditemukan.");
  }

  // Jika pengguna mendaftar via Google dan belum pernah mengatur password lokal
  if (!user.password) {
    throw new BadRequestError(
      'Anda belum mengatur password lokal. Silakan gunakan opsi "Lupa Password" untuk membuat password baru jika Anda login via Google.'
    );
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError("Password saat ini yang Anda masukkan salah.");
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError(
      "Password baru tidak boleh sama dengan password saat ini."
    );
  }

  // Password baru akan di-hash oleh pre-save hook di User model
  user.password = newPassword;
  await user.save();

  // Opsional: Kirim email notifikasi bahwa password telah diubah (plain text)
  const confirmationText = `
Halo ${user.username || "Pengguna"},

Password untuk akun JudiGuard Anda (${
    user.email
  }) telah berhasil diubah melalui halaman profil pada ${new Date().toLocaleString(
    "id-ID",
    { timeZone: "Asia/Jakarta" }
  )}.

Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda.

Terima kasih,
Tim JudiGuard
  `.trim();

  try {
    const emailConfirmationResult = await sendEmail({
      email: user.email,
      subject: "Pemberitahuan Perubahan Password Akun JudiGuard",
      text: confirmationText,
    });
    if (!emailConfirmationResult.success) {
      console.warn(
        "Gagal mengirim email notifikasi perubahan password (change password):",
        emailConfirmationResult.error
      );
    }
  } catch (emailError) {
    console.error(
      "Error mengirim email notifikasi perubahan password (change password):",
      emailError
    );
  }
  // Keberhasilan atau kegagalan pengiriman email notifikasi tidak menghentikan respons sukses utama
};

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,

  signInWithGoogle,
  handleYoutubeOAuthCallback,
  disconnectYouTubeAccount,

  requestPasswordReset,
  processPasswordReset,
  changeUserPassword,
};
