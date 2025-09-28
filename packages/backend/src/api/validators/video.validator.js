// validators/video.validator.js
const Joi = require("joi");

// Skema untuk validasi body saat submit video untuk analisis
const submitVideoSchema = Joi.object({
  videoUrl: Joi.string()
    .uri({
      scheme: ["http", "https"], // Perbaikan: "https" bukan "httpshttps"
    })
    .required()
    .messages({
      "string.base": '"videoUrl" harus berupa teks.',
      "string.uriCustomScheme":
        '"videoUrl" harus berupa URL yang valid dengan skema http atau https.', // Pesan yang lebih spesifik jika scheme tidak cocok
      "string.uri": '"videoUrl" harus berupa URL yang valid.', // Fallback umum untuk URI
      "any.required": '"videoUrl" tidak boleh kosong.',
    }),
  // userId biasanya diambil dari req.user (hasil autentikasi),
  // jadi tidak perlu divalidasi dari body request di sini.
});

// Skema untuk memvalidasi analysisId sebagai MongoDB ObjectId dari parameter URL
const analysisIdParamSchema = Joi.object({
  analysisId: Joi.string()
    .hex() // Memastikan string hanya berisi karakter heksadesimal
    .length(24) // Memastikan panjangnya 24 karakter (standar ObjectId)
    .required()
    .messages({
      "string.base": '"ID Analisis" harus berupa teks.',
      "string.hex": 'Format "ID Analisis" tidak valid (harus heksadesimal).',
      "string.length": 'Panjang "ID Analisis" harus 24 karakter.',
      "any.required": 'Parameter "ID Analisis" wajib diisi.',
    }),
});

// Skema untuk memvalidasi analyzedCommentAppId sebagai MongoDB ObjectId dari parameter URL
const commentAppIdParamSchema = Joi.object({
  analyzedCommentAppId: Joi.string().hex().length(24).required().messages({
    "string.base": '"ID Komentar Aplikasi" harus berupa teks.',
    "string.hex":
      'Format "ID Komentar Aplikasi" tidak valid (harus heksadesimal).',
    "string.length": 'Panjang "ID Komentar Aplikasi" harus 24 karakter.',
    "any.required": 'Parameter "ID Komentar Aplikasi" wajib diisi.',
  }),
});

module.exports = {
  submitVideoSchema,
  analysisIdParamSchema,
  commentAppIdParamSchema,
};
