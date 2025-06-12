const mlApiClient = require("../../core/mlApiClient"); // Impor klien axios kita

const AI_MODEL_VERSION = "distilbert-flask-v1";

/**
 * Menganalisis teks dengan memanggil ML API eksternal yang dibuat dengan Flask.
 * @param {string} text Teks yang akan dianalisis.
 * @returns {Promise<object>} Objek hasil analisis.
 */
const analyzeTextWithAI = async (text) => {
  try {
    // Tembak endpoint /api/predict. Body request: { text: "..." }
    const response = await mlApiClient.post("/api/predict", { text });

    return {
      classification: response.data.classification,
      confidenceScore: response.data.confidenceScore,
      modelVersion: AI_MODEL_VERSION,
    };
  } catch (error) {
    console.error(`Gagal memanggil ML API (Flask): ${error.message}`);
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
