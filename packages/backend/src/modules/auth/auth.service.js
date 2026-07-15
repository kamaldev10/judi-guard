import { UserRepository } from '#modules/user/user.repository.js';
import { AppError, UnauthorizedError } from '#shared/utils/errors.js';
import config from '#config/environment.js';
import { OAuth2Client } from 'google-auth-library';
import * as tokenService from '#modules/auth/token.service.js';

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
    role: user.role || 'explorer',
    workspaceId: user.workspaceId || null,
  };
  const { accessToken, refreshToken } = await tokenService.generateTokenPair(payload);

  const userResponse = user.toObject();
  delete userResponse.password;

  return { accessToken, refreshToken, user: userResponse };
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

    if (!user) {
      // User baru — return info so controller can direct to OTP flow
      return { status: 'register_required', email, googleId, name: nameFromGoogle, picture };
    }

    // User existing
    if (!user.googleId) user.googleId = googleId;
    if (!user.isVerified && payload.email_verified) user.isVerified = true;
    user.fullName = nameFromGoogle;
    user.profilePictureUrl = picture;
    await user.save();

    const appTokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'explorer',
      workspaceId: user.workspaceId || null,
    };
    const { accessToken, refreshToken } = await tokenService.generateTokenPair(appTokenPayload);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.googleId;

    return { accessToken, refreshToken, user: userResponse, isNewUser: false };
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
