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

module.exports = {
  registerSchema,
  loginSchema, // Tambahkan ini
};
