import { UserRepository } from '#modules/user/user.repository.js';
import PasswordReset from './password-reset.model.js';
import { BadRequestError, UnauthorizedError, NotFoundError } from '#shared/utils/errors.js';
import { generateRandomToken } from '#shared/utils/jwt.js';
import sendEmail from '#shared/utils/email-sender.js';
import {
  passwordReset,
  passwordResetConfirmation,
  passwordChangeNotification,
} from '#shared/email-templates/index.js';
import * as tokenService from '#modules/auth/token.service.js';
import crypto from 'crypto';
import config from '#config/environment.js';

export const requestPasswordReset = async (emailAddress) => {
  try {
    const user = await UserRepository.findByEmailWithPasswordAndGoogleId(
      emailAddress.toLowerCase(),
    );

    if (!user) {
      return { status: 'USER_NOT_FOUND' };
    }

    if (user.googleId && !user.password) {
      return { status: 'IS_GOOGLE_ONLY_ACCOUNT', email: user.email };
    }

    if (user.password) {
      await PasswordReset.deleteMany({ userId: user._id });

      const resetToken = generateRandomToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await PasswordReset.create({
        userId: user._id,
        token: resetToken,
        expiresAt,
      });

      const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;

      const { subject, text, html } = passwordReset({
        username: user.username,
        resetUrl,
      });

      try {
        const emailResult = await sendEmail({ email: user.email, subject, text, html });

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
          await PasswordReset.deleteOne({ token: resetToken, userId: user._id });
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
        await PasswordReset.deleteOne({ token: resetToken, userId: user._id });
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
  const passwordResetEntry = await PasswordReset.findOne({ token: hashedTokenToSearch });

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
    await PasswordReset.findByIdAndDelete(passwordResetEntry._id);
    throw new NotFoundError('Pengguna yang terkait dengan token ini tidak ditemukan.');
  }

  user.password = newPassword;
  await user.save();

  await PasswordReset.findByIdAndDelete(passwordResetEntry._id);

  tokenService.revokeUserTokens(user._id);

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const { subject, text, html } = passwordResetConfirmation({
    username: user.username,
    email: user.email,
    timestamp,
  });

  try {
    const emailConfirmationResult = await sendEmail({ email: user.email, subject, text, html });

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

  tokenService.revokeUserTokens(user._id);

  const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
  const { subject, text, html } = passwordChangeNotification({
    username: user.username,
    email: user.email,
    timestamp,
  });

  try {
    const emailConfirmationResult = await sendEmail({ email: user.email, subject, text, html });
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
