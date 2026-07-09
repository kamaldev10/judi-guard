import { BadRequestError } from '#shared/utils/errors.js';

const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Kumpulkan semua error, bukan hanya yang pertama
      stripUnknown: true, // Hapus field yang tidak ada di skema
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return next(new BadRequestError(errorMessage));
    }

    // Ganti req[property] dengan data yang sudah divalidasi (dan mungkin di-strip)
    req[property] = value;
    next();
  };
};

export default validateRequest;
