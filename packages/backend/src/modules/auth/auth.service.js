import { UserRepository } from '#modules/user/user.repository.js';
import { PasswordResetRepository } from './password-reset.repository.js';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '#shared/utils/errors.js';
import { generateToken, generateRandomToken } from '#shared/utils/jwt.js';
import googleOAuth2Client from '#shared/clients/google-oauth2.client.js';
import { google } from 'googleapis';
import sendEmail from '#shared/utils/email-sender.js';
import crypto from 'crypto';
import config from '#config/environment.js';
import { OAuth2Client } from 'google-auth-library';

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const registerUser = async (userData) => {
  const { username, email, password } = userData;

  let existingUser = await UserRepository.findByEmail(email); // Hanya cek email untuk OTP flow
  if (existingUser && existingUser.isVerified) {
    throw new BadRequestError('Email sudah terdaftar. Silakan login.');
  }
  if (existingUser && !existingUser.isVerified) {
    console.log(`Email ${email} sudah terdaftar tapi belum diverifikasi. Mengupdate OTP.`);
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP berlaku 10 menit

  let userToSave;
  if (existingUser && !existingUser.isVerified) {
    // User sudah ada, update OTP-nya
    existingUser.otpCode = otp;
    existingUser.otpExpiresAt = otpExpiresAt;
    userToSave = existingUser;
  } else {
    // User baru, buat entri baru
    const existingUsername = await UserRepository.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestError('Username sudah digunakan. Silakan gunakan username lain.');
    }
    
    const isFirstUser = (await UserRepository.countDocuments({})) === 0;
    userToSave = await UserRepository.create({
      username,
      email,
      password, // Akan di-hash oleh pre-save hook
      otpCode: otp,
      otpExpiresAt,
      isVerified: false,
      role: isFirstUser ? 'owner' : 'member',
    });
  }

  try {
    if (existingUser && !existingUser.isVerified) {
        await userToSave.save();
    }
    // Jika tidak existing, `UserRepository.create` sudah menyimpan ke DB.

    // Kirim email OTP
    const emailOptions = {
      email: userToSave.email,
      subject: 'Kode Verifikasi OTP Judi Guard Anda',
      text: `Halo ${userToSave.username},\n\nKode OTP Anda adalah: ${otp}\nKode ini berlaku selama 10 menit.\n\nJika Anda tidak meminta kode ini, abaikan email ini.\n\nTerima kasih,\nTim Judi Guard`,
    };

    const emailResult = await sendEmail(emailOptions);
    if (!emailResult.success) {
      console.error('Gagal mengirim email OTP setelah registrasi:', emailResult.error);
    }
    if (emailResult.previewUrl) {
      console.log(`Email OTP dikirim (Ethereal). Preview: ${emailResult.previewUrl}`);
    }

    const userResponse = userToSave.toObject ? userToSave.toObject() : { ...userToSave._doc };
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.otpExpiresAt;

    return {
      message: `Registrasi berhasil. Kode OTP telah dikirim ke ${userToSave.email}. Silakan cek email Anda.`,
      user: userResponse,
    };
  } catch (error) {
    if (error.name === 'ValidationError') {
      /* ... */
    }
    if (error.code === 11000) {
      /* ... */
    }
    throw new AppError(`Gagal mendaftarkan pengguna: ${error.message}`, 500);
  }
};

export const verifyOtp = async (email, otpCode) => {
  if (!email || !otpCode) {
    throw new BadRequestError('Email dan kode OTP diperlukan.');
  }

  const user = await UserRepository.findByEmailWithOtp(email);
  if (!user) {
    throw new NotFoundError('Pengguna tidak ditemukan.');
  }
  if (user.isVerified) {
    throw new BadRequestError('Akun ini sudah diverifikasi sebelumnya.');
  }
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new BadRequestError(
      'Tidak ada OTP yang tertunda untuk akun ini. Silakan daftar atau minta OTP baru.',
    );
  }
  if (user.otpCode !== otpCode) {
    throw new BadRequestError('Kode OTP salah.');
  }
  if (new Date() > user.otpExpiresAt) {
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    throw new BadRequestError('Kode OTP sudah kedaluwarsa. Silakan minta OTP baru.');
  }

  user.isVerified = true;
  user.otpCode = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const judiGuardTokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role || 'member',
  };
  const token = generateToken(judiGuardTokenPayload);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.otpCode;
  delete userResponse.otpExpiresAt;

  return {
    message: 'Verifikasi OTP berhasil! Anda sekarang login.',
    token,
    user: userResponse,
  };
};

export const resendOtp = async (email) => {
  if (!email) {
    throw new BadRequestError('Email diperlukan untuk mengirim ulang OTP.');
  }

  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw new NotFoundError('Pengguna dengan email ini tidak ditemukan.');
  }
  if (user.isVerified) {
    throw new BadRequestError('Akun ini sudah diverifikasi.');
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.otpCode = otp;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  const emailOptions = {
    email: user.email,
    subject: 'Kode Verifikasi OTP Judi Guard Anda (Kirim Ulang)',
    text: `Halo ${user.username},\n\nKode OTP baru Anda adalah: ${otp}\nKode ini berlaku selama 10 menit.\n\nTerima kasih,\nTim Judi Guard`,
  };

  const emailResult = await sendEmail(emailOptions);
  if (!emailResult.success) {
    console.error('Gagal mengirim ulang email OTP:', emailResult.error);
  }
  if (emailResult.previewUrl) {
    console.log(`Email OTP (kirim ulang) dikirim. Preview: ${emailResult.previewUrl}`);
  }

  return { message: `Kode OTP baru telah dikirim ke ${user.email}.` };
};

export const loginUser = async (userData) => {
  const { email, password } = userData;

  const user = await UserRepository.findByEmailWithPassword(email);

  if (!user) {
    throw new UnauthorizedError('Akun belum terdaftar.');
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    throw new UnauthorizedError('Password anda salah.');
  }

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role || 'member',
  };
  const token = generateToken(payload);

  const userResponse = user.toObject();
  delete userResponse.password;

  console.log(userResponse);
  return { token, user: userResponse };
};

export const signInWithGoogle = async (idTokenString) => {
  if (!config.googleSignIn || !config.googleSignIn.clientId) {
    console.error('Konfigurasi Google Sign-In Client ID di backend belum lengkap.');
    throw new AppError('Konfigurasi Google Sign-In Client ID di backend belum lengkap.', 500);
  }
  const googleIdTokenVerifierClient = new OAuth2Client(config.googleSignIn.clientId);

  try {
    const ticket = await googleIdTokenVerifierClient.verifyIdToken({
      idToken: idTokenString,
      audience: config.googleSignIn.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new UnauthorizedError('Google ID Token tidak valid atau informasi tidak lengkap.');
    }

    if (!payload.email_verified) {
      console.warn(
        `Percobaan masuk dengan email Google yang belum terverifikasi: ${payload.email}`,
      );
    }

    const googleId = payload.sub;
    const email = payload.email;
    const nameFromGoogle = payload.name || email.split('@')[0];
    const picture = payload.picture;

    let user = await UserRepository.findByGoogleIdOrEmail(googleId, email);

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      let username = nameFromGoogle.replace(/\s+/g, '').toLowerCase();
      let count = 0;
      let tempUsername = username;
      while (await UserRepository.findByUsername(tempUsername)) {
        count++;
        tempUsername = `${username}${count}`;
      }
      username = tempUsername;

      const isFirstUser = (await UserRepository.countDocuments({})) === 0;
      user = await UserRepository.create({
        googleId: googleId,
        email: email,
        username: username,
        isVerified: payload.email_verified || true,
        fullName: nameFromGoogle,
        profilePictureUrl: picture,
        role: isFirstUser ? 'owner' : 'member',
      });
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.isVerified && payload.email_verified) user.isVerified = true;
      user.fullName = nameFromGoogle;
      user.profilePictureUrl = picture;
      await user.save();
    }

    const appTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'member',
    };
    const token = generateToken(appTokenPayload);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.googleId;

    return { token, user: userResponse, isNewUser };
  } catch (error) {
    console.error('Error saat sign in with Google (util):', error.message);
    if (
      error.message.includes('Token used too late') ||
      error.message.includes('Invalid token signature')
    ) {
      throw new UnauthorizedError('Sesi Google tidak valid atau kedaluwarsa. Silakan coba lagi.');
    }
    if (error instanceof AppError || error instanceof UnauthorizedError) throw error;
    throw new AppError(`Gagal autentikasi dengan Google: ${error.message}`, 500);
  }
};

export const handleYoutubeOAuthCallback = async (authCode, judiGuardUserId) => {
  try {
    const oAuth2Client = googleOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(authCode);

    const updateData = {
      youtubeAccessToken: tokens.access_token,
      youtubeTokenExpiresAt: new Date(tokens.expiry_date),
      isYoutubeConnected: true, 
    };

    if (tokens.refresh_token) {
      updateData.youtubeRefreshToken = tokens.refresh_token;
    }

    oAuth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });

    try {
      const channelInfoResponse = await youtube.channels.list({
        mine: true,
        part: 'id,snippet',
      });

      if (channelInfoResponse.data.items?.length > 0) {
        const channel = channelInfoResponse.data.items[0];
        updateData.youtubeChannelId = channel.id;
        updateData.youtubeChannelName = channel.snippet.title;
        updateData.youtubeChannelThumbnailUrl = channel.snippet.thumbnails?.default?.url; 
      }
    } catch (channelError) {
      console.error('Gagal mendapatkan info channel:', channelError.message);
    }

    const updatedUser = await UserRepository.updateById(judiGuardUserId, updateData, {
      new: true,
      runValidators: true,
    });
    
    // Select excludes password, let's just delete it
    if (!updatedUser) {
      throw new AppError('User tidak ditemukan.', 404);
    }

    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.youtubeAccessToken;
    delete userResponse.youtubeRefreshToken;

    return { message: 'Akun YouTube berhasil terhubung!', user: userResponse };
  } catch (error) {
    console.error('Error callback OAuth:', error.message);
    throw new AppError(`Gagal menghubungkan YouTube: ${error.message}`, 500);
  }
};

export const disconnectYouTubeAccount = async (userId) => {
  const user = await UserRepository.findById(userId);
  if (!user) throw new NotFoundError('Pengguna tidak ditemukan.');

  user.youtubeAccessToken = undefined;
  user.youtubeRefreshToken = undefined;
  user.youtubeTokenExpiresAt = undefined;
  user.youtubeChannelId = undefined;
  user.youtubeChannelName = undefined;
  user.isYoutubeConnected = false; 

  await user.save();

  const userToReturn = user.toObject();
  delete userToReturn.password;
  delete userToReturn.youtubeAccessToken;
  delete userToReturn.youtubeRefreshToken;

  return userToReturn;
};

export const requestPasswordReset = async (emailAddress) => {
  try {
    const user = await UserRepository.findByEmailWithPasswordAndGoogleId(emailAddress.toLowerCase());

    if (!user) {
      return { status: 'USER_NOT_FOUND' };
    }

    if (user.googleId && !user.password) {
      return { status: 'IS_GOOGLE_ONLY_ACCOUNT', email: user.email };
    }

    if (user.password) {
      await PasswordResetRepository.deleteManyByUserId(user._id);

      const resetToken = generateRandomToken(); 
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

      await PasswordResetRepository.create({
        userId: user._id,
        token: resetToken,
        expiresAt,
      });

      const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`; 

      const emailSubject = 'Instruksi Reset Kata Sandi Akun Anda';
      const emailText = `
          Halo ${user.username || 'Pengguna'},

          Anda (atau seseorang) telah meminta untuk mereset kata sandi untuk akun Anda di ${
            config.appName || 'Judi Guard Application'
          }.
          Jika ini adalah Anda, silakan klik tautan di bawah ini untuk melanjutkan:
          ${resetUrl}

          Tautan ini akan kedaluwarsa dalam 15 menit.

          Jika Anda tidak meminta reset kata sandi ini, Anda bisa mengabaikan email ini dengan aman.

          Terima kasih,
          Tim ${config.appName || 'Judi Guard Application'}
      `.trim();

      try {
        const emailResult = await sendEmail({
          email: user.email,
          subject: emailSubject,
          text: emailText,
        });

        if (emailResult && emailResult.success) {
          if (emailResult.previewUrl) {
            console.log(`Password reset email preview URL (Ethereal): ${emailResult.previewUrl}`);
          }
          console.info(`Password reset email sent successfully to: ${user.email}`);
          return { status: 'RESET_EMAIL_SENT' };
        } else {
          console.error(
            `Failed to send password reset email (reported by emailSender) to ${user.email}:`,
            emailResult ? emailResult.error : 'Unknown email sending error',
          );
          await PasswordResetRepository.deleteByTokenAndUserId(resetToken, user._id);
          return {
            status: 'EMAIL_SEND_FAILED',
            error: emailResult ? emailResult.error : new Error('Unknown email sending error'),
          };
        }
      } catch (error) {
        console.error(
          `Critical error during sendEmail call for password reset to ${user.email}:`,
          error,
        );
        await PasswordResetRepository.deleteByTokenAndUserId(resetToken, user._id);
        return { status: 'EMAIL_SEND_FAILED', error };
      }
    }

    console.error(
      `Password reset attempt for user in unknown state (no password, no googleId): ${emailAddress}`,
    );
    return { status: 'UNKNOWN_USER_STATE' };
  } catch (error) {
    console.error(`System error in requestPasswordReset for email ${emailAddress}:`, error);
    return { status: 'SERVICE_ERROR', error };
  }
};

export const processPasswordReset = async (plainTokenFromURL, newPassword) => {
  const hashedTokenToSearch = crypto.createHash('sha256').update(plainTokenFromURL).digest('hex');
  const passwordResetEntry = await PasswordResetRepository.findByToken(hashedTokenToSearch);

  if (!passwordResetEntry) {
    throw new BadRequestError('Token reset tidak valid atau sudah kedaluwarsa.');
  }

  if (passwordResetEntry.expiresAt < new Date()) {
    throw new BadRequestError(
      'Token reset sudah kedaluwarsa. Silakan minta reset kata sandi lagi.',
    );
  }

  const user = await UserRepository.findById(passwordResetEntry.userId);
  if (!user) {
    await PasswordResetRepository.deleteById(passwordResetEntry._id);
    throw new NotFoundError('Pengguna yang terkait dengan token ini tidak ditemukan.');
  }

  user.password = newPassword;
  await user.save();

  await PasswordResetRepository.deleteById(passwordResetEntry._id);

  const confirmationText = `
Halo ${user.username || 'Pengguna'},

Kata sandi untuk akun JudiGuard Anda (${
    user.email
  }) telah berhasil diubah pada ${new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
  })}.

Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda dan hubungi tim support kami.

Terima kasih,
Tim JudiGuard
  `.trim();

  try {
    const emailConfirmationResult = await sendEmail({
      email: user.email,
      subject: 'Konfirmasi Perubahan Kata Sandi Akun JudiGuard',
      text: confirmationText, 
    });

    if (!emailConfirmationResult.success) {
      console.warn(
        'Failed to send password change confirmation email (reported by emailSender):',
        emailConfirmationResult.error,
      );
    }
    if (emailConfirmationResult.previewUrl) {
      console.log(
        `Ethereal preview URL for password confirmation: ${emailConfirmationResult.previewUrl}`,
      );
    }
  } catch (emailError) {
    console.error('Error during sendEmail call for password change confirmation:', emailError);
  }
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await UserRepository.findByIdWithPassword(userId);

  if (!user) {
    throw new NotFoundError('Pengguna tidak ditemukan.');
  }

  if (!user.password) {
    throw new BadRequestError(
      'Anda belum mengatur password lokal. Silakan gunakan opsi "Lupa Password" untuk membuat password baru jika Anda login via Google.',
    );
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthorizedError('Password saat ini yang Anda masukkan salah.');
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError('Password baru tidak boleh sama dengan password saat ini.');
  }

  user.password = newPassword;
  await user.save();

  const confirmationText = `
Halo ${user.username || 'Pengguna'},

Password untuk akun JudiGuard Anda (${
    user.email
  }) telah berhasil diubah melalui halaman profil pada ${new Date().toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
  })}.

Jika Anda merasa tidak melakukan perubahan ini, segera amankan akun Anda.

Terima kasih,
Tim JudiGuard
  `.trim();

  try {
    const emailConfirmationResult = await sendEmail({
      email: user.email,
      subject: 'Pemberitahuan Perubahan Password Akun JudiGuard',
      text: confirmationText,
    });
    if (!emailConfirmationResult.success) {
      console.warn(
        'Gagal mengirim email notifikasi perubahan password (change password):',
        emailConfirmationResult.error,
      );
    }
  } catch (emailError) {
    console.error(
      'Error mengirim email notifikasi perubahan password (change password):',
      emailError,
    );
  }
};
