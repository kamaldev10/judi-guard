// src/api/routes/auth.routes.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const validateRequest = require("../middlewares/validateRequest");
const {
  registerSchema,
  loginSchema,
  otpSchema,
  emailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  authController.handleRegister
);

router.post(
  "/verify-otp",
  validateRequest(otpSchema, "body"),
  authController.handleVerifyOtp
);

router.post(
  "/resend-otp",
  validateRequest(emailSchema, "body"),
  authController.handleResendOtp
);

router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  authController.handleLogin
);

router.post("/google/signin", authController.handleGoogleAuth);

router.get(
  "/youtube/connect",
  isAuthenticated,
  authController.redirectToGoogleOAuth
);

router.get("/youtube/callback", authController.handleGoogleOAuthCallback);

router.post(
  "/youtube/disconnect",
  isAuthenticated,
  authController.handleDisconnectYouTube
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  authController.handleForgotPassword
);

router.put(
  "/reset-password/:token",
  validateRequest(resetPasswordSchema),
  authController.handleResetPassword
);

router.put(
  "/change-password",
  isAuthenticated, // 2. Pastikan pengguna sudah login
  // Jika changePasswordSchema Anda memvalidasi req.body (currentPassword, newPassword, confirmPassword),
  // Anda mungkin perlu validateRequest(changePasswordSchema, "body") jika middleware Anda memerlukannya,
  // atau validateRequest(changePasswordSchema) jika middleware Anda cerdas.
  // Saya akan mengikuti pola yang paling mirip dengan '/reset-password/:token' untuk konsistensi jika skema sudah mencakup targetnya.
  validateRequest(changePasswordSchema), // 3. Validasi input
  authController.handleChangePassword // 4. Panggil handler controller baru
);

module.exports = router;
