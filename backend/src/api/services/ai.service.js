const mlApiClient = require("../../core/mlApiClient"); // Impor klien axios kita

const AI_MODEL_VERSION = "distilbert-v1.0-deployed";

/**
 * Menganalisis teks dengan memanggil ML API eksternal.
 * @param {string} text Teks yang akan dianalisis.
 * @returns {Promise<object>} Objek hasil analisis { classification, confidenceScore, modelVersion }.
 */
const analyzeTextWithAI = async (text) => {
  try {
    console.log(
      `[AI Service] Mengirim teks ke ML API: "${text.substring(0, 30)}..."`
    );

    // Panggil endpoint /analyze di ML API
    const response = await mlApiClient.post("/analyze", { text });

    // Kembalikan data yang bersih dari respons API
    return {
      classification: response.data.classification,
      confidenceScore: response.data.confidenceScore,
      modelVersion: AI_MODEL_VERSION,
    };
  } catch (error) {
    console.error(`[AI Service] Gagal memanggil ML API: ${error.message}`);
    // Jika gagal, kembalikan status error agar bisa ditangani oleh pemanggil
    return {
      classification: "ERROR_ANALYSIS",
      confidenceScore: 0,
      modelVersion: AI_MODEL_VERSION,
    };
  }
};

module.exports = {
  analyzeTextWithAI,
};
