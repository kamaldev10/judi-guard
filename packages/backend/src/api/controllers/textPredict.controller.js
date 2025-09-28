const aiService = require("../services/ai.service");
const { BadRequestError } = require("../../utils/errors");

/**
 * Menerima satu buah teks dari body request, menganalisisnya menggunakan ai.service,
 * dan mengembalikan hasilnya secara langsung.
 */
const textPredict = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      throw new BadRequestError(
        'Input "text" diperlukan dan tidak boleh kosong.'
      );
    }

    // Langsung panggil ai.service yang sudah ada untuk mendapatkan prediksi
    const analysisResult = await aiService.analyzeTextWithAI(text);

    // Kirim hasil prediksi kembali ke client
    res.status(200).json({
      status: "success",
      message: "Teks berhasil dianalisis.",
      data: analysisResult,
    });
  } catch (error) {
    next(error); // Teruskan error ke global error handler
  }
};

module.exports = {
  textPredict,
};
