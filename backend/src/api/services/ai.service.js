// Komunikasi dengan service AI Anda
// src/api/services/ai.service.js

/**
 * Mensimulasikan analisis teks komentar oleh AI.
 * Ganti ini dengan logika pemanggilan API ke model AI Anda yang sebenarnya.
 * @param {string} commentText - Teks komentar yang akan dianalisis.
 * @returns {Promise<{classification: string, confidenceScore: number, modelVersion: string}>}
 */
const analyzeCommentText = async (commentText) => {
  console.log(
    `AI Service: Menganalisis komentar -> "${commentText.substring(0, 50)}..."`
  );

  // Simulasi pemanggilan API AI (delay)
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500 + 100)
  ); // Delay 100-600ms

  // Logika dummy:
  // Jika komentar mengandung kata "slot", "gacor", "rtp", "dana", "jp", anggap "JUDI"
  // Selain itu, anggap "NON_JUDI"
  // Ini HANYA untuk placeholder, model AI Anda akan jauh lebih canggih.
  const lowerCaseText = commentText.toLowerCase();
  const judiKeywords = [
    "slot",
    "gacor",
    "rtp",
    "dana kaget",
    "jp",
    "maxwin",
    "deposit",
    "wd",
    "link",
    "daftar",
    "agen",
  ]; // Tambahkan keyword lain

  let classification = "NON_JUDI";
  let confidenceScore = 0.85 + Math.random() * 0.1; // Skor acak tinggi untuk NON_JUDI

  for (const keyword of judiKeywords) {
    if (lowerCaseText.includes(keyword)) {
      classification = "JUDI";
      confidenceScore = 0.75 + Math.random() * 0.2; // Skor acak lebih bervariasi untuk JUDI
      break;
    }
  }

  // Jika ada QR code (placeholder, butuh CV)
  if (lowerCaseText.includes("qr code") || lowerCaseText.includes("kode qr")) {
    classification = "JUDI"; // Asumsi sementara
    confidenceScore = 0.8;
  }

  console.log(
    `AI Service: Hasil analisis untuk "${commentText.substring(
      0,
      50
    )}..." -> ${classification} (Score: ${confidenceScore.toFixed(2)})`
  );

  return {
    classification,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    modelVersion: "dummy-v0.1",
  };
};

module.exports = {
  analyzeCommentText,
};
