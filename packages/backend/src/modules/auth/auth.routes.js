import rateLimit from 'express-rate-limit';
import * as authController from '#modules/auth/auth.controller.js';
import * as userController from '#modules/user/user.controller.js';
import validateRequest from '#middlewares/validate-request.js';
import * as authValidator from '#modules/auth/auth.validator.js';
import express from 'express';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';
import requireYoutubeAccess from '#middlewares/require-youtube-access.js';

// strict limiter for auth endpoints, 10 req/15min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Terlalu banyak percobaan, coba lagi dalam 15 menit.' },
});

export const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(authValidator.registerSchema, 'body'),
  authController.handleRegister,
);

router.post(
  '/verify-otp',
  authLimiter,
  validateRequest(authValidator.otpSchema, 'body'),
  authController.handleVerifyOtp,
);

router.post(
  '/resend-otp',
  authLimiter,
  validateRequest(authValidator.emailSchema, 'body'),
  authController.handleResendOtp,
);

router.post(
  '/login',
  authLimiter,
  validateRequest(authValidator.loginSchema, 'body'),
  authController.handleLogin,
);

router.post(
  '/google/signin',
  authLimiter,
  validateRequest(authValidator.googleLoginSchema, 'body'),
  authController.handleGoogleAuth,
);

router.post(
  '/set-password',
  authLimiter,
  validateRequest(authValidator.setPasswordSchema, 'body'),
  authController.handleSetPassword,
);

router.get(
  '/youtube/connect',
  requireAuth,
  requirePermission('youtube:connect'),
  authController.redirectToGoogleOAuth,
);

router.get(
  '/youtube/callback',
  requireAuth,
  requirePermission('youtube:connect'),
  authController.handleGoogleOAuthCallback,
);

router.post(
  '/youtube/disconnect',
  requireAuth,
  requirePermission('youtube:connect'),
  authController.handleDisconnectYouTube,
);

router.get(
  '/youtube/profile',
  requireAuth,
  requirePermission('youtube:connect'),
  requireYoutubeAccess,
  userController.getYoutubeProfile,
);

// Deprecate guest auth routes
router.all('/guest', (req, res) => {
  res.status(410).json({
    status: 'fail',
    message: 'Rute guest auth telah dinonaktifkan.',
  });
});

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(authValidator.forgotPasswordSchema),
  authController.handleForgotPassword,
);

router.put(
  '/reset-password/:token',
  validateRequest(authValidator.resetPasswordSchema),
  authController.handleResetPassword,
);

router.patch(
  '/change-password',
  requireAuth,
  requirePermission('profile:write'),
  validateRequest(authValidator.changePasswordSchema),
  authController.handleChangePassword,
);

router.post(
  '/refresh',
  authLimiter,
  validateRequest(authValidator.refreshTokenSchema, 'body'),
  authController.handleRefreshToken,
);

router.post('/logout', requireAuth, authController.handleLogout);

export default router;
