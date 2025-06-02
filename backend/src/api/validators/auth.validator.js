// src/api/validators/auth.validator.js
const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": `"username" harus berupa teks`,
    "string.alphanum": `"username" hanya boleh berisi karakter alfanumerik`,
    "string.min": `"username" minimal {#limit} karakter`,
    "string.max": `"username" maksimal {#limit} karakter`,
    "any.required": `"username" tidak boleh kosong`,
  }),
  email: Joi.string().email().required().messages({
    "string.email": `"email" harus berupa alamat email yang valid`,
    "any.required": `"email" tidak boleh kosong`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": `"password" minimal {#limit} karakter`,
    "any.required": `"password" tidak boleh kosong`,
  }),
});

// TAMBAHKAN INI
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": `"email" harus berupa alamat email yang valid`,
    "any.required": `"email" tidak boleh kosong`,
  }),
  password: Joi.string().required().messages({
    "any.required": `"password" tidak boleh kosong`,
  }),
});

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
const forgotPasswordSchema = Joi.object({
  // Asumsi ini adalah skema untuk req.body
  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid.",
    "any.required": "Email wajib diisi.",
  }),
});

const resetPasswordSchema = Joi.object({
  // Asumsi ini adalah skema untuk req.body
  password: Joi.string().min(6).required().messages({
    "string.min": "Password baru minimal harus {#limit} karakter.",
    "any.required": "Password baru wajib diisi.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Konfirmasi password baru tidak cocok.",
    "any.required": "Konfirmasi password baru wajib diisi.",
  }),
});

const changePasswordSchema = Joi.object({
  // Ini adalah skema langsung untuk req.body
  currentPassword: Joi.string().required().messages({
    "any.required": "Password saat ini wajib diisi.",
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.min": "Password baru minimal harus {#limit} karakter.",
    "any.required": "Password baru wajib diisi.",
  }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Konfirmasi password baru tidak cocok.",
      "any.required": "Konfirmasi password baru wajib diisi.",
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSchema,
  emailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
