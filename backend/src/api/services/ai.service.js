// // src/api/services/ai.service.js
// const mlApiClient = require("../../core/mlApiClients");
// const AI_MODEL_VERSION = "distilbert-v1.0-deployed"; // Anda bisa mengubah ini sesuai versi model yang di-deploy

// /**
//  * Menganalisis sebuah teks dengan MEMANGGIL service AI eksternal.
//  * @param {string} text - Teks komentar yang akan dianalisis.
//  * @returns {Promise<{classification: string, confidenceScore: number, modelVersion: string}>} Hasil analisis.
//  */
// const analyzeTextWithAI = async (text) => {
//   try {
//     // Panggil endpoint /analyze di ML API kita.
//     // `baseURL` sudah diatur, jadi kita hanya perlu path-nya.
//     // Body request adalah { text: "..." } sesuai spesifikasi FastAPI kita.
//     const response = await mlApiClient.post("/analyze", { text });

//     // Kembalikan data yang relevan dari respons API
//     return {
//       classification: response.data.classification,
//       confidenceScore: response.data.confidenceScore,
//       modelVersion: AI_MODEL_VERSION,
//     };
//   } catch (error) {
//     // Tangani error jika ML API down, timeout, atau mengembalikan error.
//     console.error(
//       `Error calling AI service for text: "${text.substring(0, 30)}..."`,
//       error.message
//     );
//     return {
//       classification: "ERROR_ANALYSIS",
//       confidenceScore: 0,
//       modelVersion: AI_MODEL_VERSION,
//     };
//   }
// };

// module.exports = {
//   analyzeTextWithAI,
// };

// ====DUMMY test=======//

// src/api/services/ai.service.js

const DUMMY_MODEL_VERSION = "dummy-v1.0-keyword-based";

/**
 * Versi DUMMY dari ai.service untuk keperluan testing backend.
 * Tidak memanggil API eksternal.
 * Logika: Jika teks mengandung keyword tertentu, akan diklasifikasikan sebagai 'JUDI',
 * jika tidak maka 'NON_JUDI'.
 * Mensimulasikan delay jaringan kecil.
 *
 * @param {string} text - Teks komentar yang akan dianalisis.
 * @returns {Promise<{classification: string, confidenceScore: number, modelVersion: string}>} Hasil analisis dummy.
 */
const analyzeTextWithAI = async (text) => {
  // Daftar kata kunci sederhana untuk simulasi
  const judiKeywords = [
    "slot",
    "gacor",
    "jackpot",
    "jp",
    "maxwin",
    "wd",
    "deposit",
    "scatter",
    "gates of olympus",
    "rtp",
    "pragmatic",
    "situs",
    "link",
    "daftar",
    "login",
    "bonus",
    "cashback",
    "server kamboja",
  ];

  // Simulasikan delay jaringan agar terasa seperti panggilan API sungguhan (50-150ms)
  const simulatedDelay = 50 + Math.random() * 100;
  await new Promise((resolve) => setTimeout(resolve, simulatedDelay));

  // Ubah teks menjadi huruf kecil untuk perbandingan yang tidak case-sensitive
  const lowercasedText = text.toLowerCase();

  // Cek apakah ada kata kunci 'judi' di dalam teks
  const isJudi = judiKeywords.some((keyword) =>
    lowercasedText.includes(keyword)
  );

  let classification;
  let confidenceScore;

  if (isJudi) {
    classification = "JUDI";
    // Beri skor kepercayaan tinggi yang sedikit acak agar terlihat nyata
    confidenceScore = 0.9 + Math.random() * 0.09; // Skor antara 0.90 - 0.99
  } else {
    classification = "NON_JUDI";
    // Beri skor kepercayaan tinggi juga untuk klasifikasi non-judi
    confidenceScore = 0.95 + Math.random() * 0.04; // Skor antara 0.95 - 0.99
  }

  // Mengembalikan objek dengan struktur yang SAMA PERSIS dengan service AI yang asli
  return {
    classification,
    confidenceScore: parseFloat(confidenceScore.toFixed(4)), // Bulatkan ke 4 angka desimal
    modelVersion: DUMMY_MODEL_VERSION,
  };
};

module.exports = {
  analyzeTextWithAI,
};
