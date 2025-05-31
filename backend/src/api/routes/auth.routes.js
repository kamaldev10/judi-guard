// src/api/routes/auth.routes.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const validateRequest = require("../middlewares/validateRequest");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Joi = require("joi");

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  authController.handleRegister
);
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  authController.handleLogin
);

router.post("/google/signin", authController.handleGoogleAppSignIn);

router.get(
  "/youtube/connect",
  isAuthenticated,
  authController.redirectToGoogleOAuth
);

router.get("/youtube/callback", authController.handleGoogleOAuthCallback);

// Skema validasi untuk OTP (opsional tapi bagus)
const otpSchema = Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      // Pastikan 6 digit angka
      "string.length": "Kode OTP harus 6 digit.",
      "string.pattern.base": "Kode OTP hanya boleh berisi angka.",
    }),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

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

module.exports = router;
