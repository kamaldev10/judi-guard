import Joi from 'joi';

// Skema untuk validasi body saat submit video untuk analisis
export const submitVideoSchema = Joi.object({
  videoUrl: Joi.string()
    .uri({
      scheme: ['http', 'https'],
    })
    .required()
    .messages({
      'string.base': '"videoUrl" harus berupa teks.',
      'string.uriCustomScheme':
        '"videoUrl" harus berupa URL yang valid dengan skema http atau https.',
      'string.uri': '"videoUrl" harus berupa URL yang valid.',
      'any.required': '"videoUrl" tidak boleh kosong.',
    }),
});

// Skema untuk memvalidasi analysisId sebagai MongoDB ObjectId dari parameter URL
export const analysisIdParamSchema = Joi.object({
  analysisId: Joi.string()
    .hex() // Memastikan string hanya berisi karakter heksadesimal
    .length(24) // Memastikan panjangnya 24 karakter (standar ObjectId)
    .required()
    .messages({
      'string.base': '"ID Analisis" harus berupa teks.',
      'string.hex': 'Format "ID Analisis" tidak valid (harus heksadesimal).',
      'string.length': 'Panjang "ID Analisis" harus 24 karakter.',
      'any.required': 'Parameter "ID Analisis" wajib diisi.',
    }),
});

// Skema untuk memvalidasi analyzedCommentAppId sebagai MongoDB ObjectId dari parameter URL
export const commentAppIdParamSchema = Joi.object({
  analyzedCommentAppId: Joi.string().hex().length(24).required().messages({
    'string.base': '"ID Komentar Aplikasi" harus berupa teks.',
    'string.hex': 'Format "ID Komentar Aplikasi" tidak valid (harus heksadesimal).',
    'string.length': 'Panjang "ID Komentar Aplikasi" harus 24 karakter.',
    'any.required': 'Parameter "ID Komentar Aplikasi" wajib diisi.',
  }),
});
