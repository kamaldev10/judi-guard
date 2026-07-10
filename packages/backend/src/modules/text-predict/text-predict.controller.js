import { BadRequestError } from '#shared/utils/errors.js';
import * as aiService from '#shared/services/ai.service.js';

/**
 * @openapi
 * /predict:
 *   post:
 *     tags: [Text Predict]
 *     summary: Prediksi teks
 *     description: Menganalisis satu teks menggunakan AI untuk mendeteksi konten judi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: Kunjungi situs kami untuk judi online terpercaya
 *     responses:
 *       200:
 *         description: Hasil analisis teks
 *       400:
 *         description: Input text tidak valid
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
