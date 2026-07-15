import { UserRepository } from '#modules/user/user.repository.js';
import { AppError, BadRequestError, NotFoundError } from '#shared/utils/errors.js';
import { generateToken } from '#shared/utils/jwt.js';
import sendEmail from '#shared/utils/email-sender.js';
import {
  otpVerification,
  otpVerificationGoogle,
  otpResend,
} from '#shared/email-templates/index.js';
import * as tokenService from '#modules/auth/token.service.js';
import crypto from 'crypto';

const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const registerUser = async (userData) => {
  const { username, email, password } = userData;

  let existingUser = await UserRepository.findByEmail(email);
  if (existingUser && existingUser.isVerified) {
    throw new BadRequestError('Email sudah terdaftar. Silakan login.');
  }
  if (existingUser && !existingUser.isVerified) {
    console.log(`Email ${email} sudah terdaftar tapi belum diverifikasi. Mengupdate OTP.`);
  }

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  let userToSave;
  if (existingUser && !existingUser.isVerified) {
    existingUser.otpCode = otp;
    existingUser.otpExpiresAt = otpExpiresAt;
    userToSave = existingUser;
  } else {
    const existingUsername = await UserRepository.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestError('Username sudah digunakan. Silakan gunakan username lain.');
    }

    userToSave = await UserRepository.create({
      username,
      email,
      password,
      otpCode: otp,
      otpExpiresAt,
      isVerified: false,
      role: 'explorer',
    });
  }

  try {
    if (existingUser && !existingUser.isVerified) {
      await userToSave.save();
    }

    const { subject, text, html } = otpVerification({ username: userToSave.username, otp });
    const emailOptions = { email: userToSave.email, subject, text, html };

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
      message: `Registrasi berhasil. Kode OTP telah dikirim ke ${userToSave.email}.`,
      user: userResponse,
    };
  } catch (error) {
    if (error.name === 'ValidationError') {
      /* handled by global error handler */
    }
    if (error.code === 11000) {
      /* handled by global error handler */
    }
    throw new AppError(`Gagal mendaftarkan pengguna: ${error.message}`, 500);
  }
};

/**
 * Create user from Google payload + send OTP.
 * Called after signInWithGoogle returns register_required.
 */
export const createGoogleUser = async (email, nameFromGoogle, picture, googleId = undefined) => {
  let username = nameFromGoogle.replace(/\s+/g, '').toLowerCase();
  let count = 0;
  let tempUsername = username;
  while (await UserRepository.findByUsername(tempUsername)) {
    count++;
    tempUsername = `${username}${count}`;
  }
  username = tempUsername;

  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await UserRepository.create({
    googleId,
    email,
    username,
    isVerified: false,
    otpCode: otp,
    otpExpiresAt,
    fullName: nameFromGoogle,
    profilePictureUrl: picture,
    role: 'explorer',
  });

  const { subject, text, html } = otpVerificationGoogle({ username: user.username, otp });
  await sendEmail({ email: user.email, subject, text, html }).catch((err) =>
    console.error('Gagal mengirim email OTP (Google sign-in):', err.message),
  );

  return { status: 'otp_required', email: user.email };
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

  // Jika user tidak punya password (Google sign-in), generate temp token untuk set password
  if (!user.password) {
    const tempPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'explorer',
      purpose: 'set_password',
    };
    const tempToken = generateToken({ ...tempPayload, exp: Math.floor(Date.now() / 1000) + 600 });

    return {
      status: 'set_password_required',
      message: 'Silakan buat password untuk akun Anda.',
      token: tempToken,
    };
  }

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role || 'explorer',
    workspaceId: user.workspaceId || null,
  };
  const { accessToken, refreshToken } = await tokenService.generateTokenPair(payload);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.otpCode;
  delete userResponse.otpExpiresAt;

  return {
    message: 'Verifikasi OTP berhasil! Anda sekarang login.',
    accessToken,
    refreshToken,
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

  const { subject, text, html } = otpResend({ username: user.username, otp });
  const emailOptions = { email: user.email, subject, text, html };

  const emailResult = await sendEmail(emailOptions);
  if (!emailResult.success) {
    console.error('Gagal mengirim ulang email OTP:', emailResult.error);
  }
  if (emailResult.previewUrl) {
    console.log(`Email OTP (kirim ulang) dikirim. Preview: ${emailResult.previewUrl}`);
  }

  return { message: `Kode OTP baru telah dikirim ke ${user.email}.` };
};

/**
 * Set password setelah OTP diverifikasi (khusus user dari Google sign-in).
 */
export const setPasswordAfterOtp = async (email, password) => {
  if (!email || !password) {
    throw new BadRequestError('Email dan password diperlukan.');
  }

  const user = await UserRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new NotFoundError('Pengguna dengan email ini tidak ditemukan.');
  }

  if (user.password) {
    throw new BadRequestError('Akun ini sudah memiliki password. Gunakan fitur ganti password.');
  }

  user.password = password;
  await user.save();

  const payload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role || 'explorer',
    workspaceId: user.workspaceId || null,
  };
  const { accessToken, refreshToken } = await tokenService.generateTokenPair(payload);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.googleId;

  return {
    status: 'success',
    message: 'Password berhasil dibuat. Silakan login.',
    accessToken,
    refreshToken,
    user: userResponse,
  };
};
