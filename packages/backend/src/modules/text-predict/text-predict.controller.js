import { BadRequestError } from '#shared/utils/errors.js';
import * as aiService from '#shared/services/ai.service.js';

/**
 * Menerima satu buah teks dari body request, menganalisisnya menggunakan ai.service,
 * dan mengembalikan hasilnya secara langsung.
 */
export const textPredictController = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      throw new BadRequestError('Input "text" diperlukan dan tidak boleh kosong.');
    }

    // Langsung panggil ai.service yang sudah ada untuk mendapatkan prediksi
    const analysisResult = await aiService.analyzeTextWithAI(text);

    // Kirim hasil prediksi kembali ke client
    res.status(200).json({
      status: 'success',
      message: 'Teks berhasil dianalisis.',
      data: analysisResult,
    });
  } catch (error) {
    next(error); // Teruskan error ke global error handler
  }
};
