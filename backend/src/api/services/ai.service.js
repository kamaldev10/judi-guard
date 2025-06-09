// src/api/services/ai.service.js

/**
 * Mensimulasikan analisis teks komentar oleh AI untuk klasifikasi "JUDI" atau "NON_JUDI".
 * PENTING: Ini adalah logika dummy dan harus diganti dengan pemanggilan API
 * ke model Machine Learning Anda yang sebenarnya di lingkungan produksi.
 *
 * @async
 * @function analyzeCommentText
 * @param {string} commentText - Teks komentar yang akan dianalisis.
 * @returns {Promise<{classification: string, confidenceScore: number, modelVersion: string}>}
 * Sebuah objek yang berisi hasil klasifikasi ("JUDI" atau "NON_JUDI"),
 * skor kepercayaan (antara 0 dan 1), dan versi model dummy yang digunakan.
 */
const analyzeCommentText = async (commentText) => {
  // Log bahwa service AI dipanggil dengan potongan komentar
  // console.log(
  //   `[AIService] Menganalisis komentar -> "${commentText.substring(0, 50)}..."` // Prefix log untuk konsistensi
  // );

  // Simulasi delay pemanggilan API AI yang sebenarnya
  await new Promise(
    (resolve) => setTimeout(resolve, Math.random() * 400 + 100) // Penyesuaian delay (100-500ms)
  );

  // Logika dummy untuk klasifikasi berdasarkan kata kunci.
  // INI HARUS DIGANTI dengan logika pemanggilan model AI Anda.
  const lowerCaseText = commentText.toLowerCase();
  // const judiKeywords = ["JP", "gacor", "rungkad"];
  const judiKeywords = ["jackpot", "JP", "cuan", "rapi", "gacor"];

  let classification = "NON_JUDI"; // Default klasifikasi
  let confidenceScore = 0.85 + Math.random() * 0.14; // Skor acak antara 0.85 - 0.99 untuk NON_JUDI

  for (const keyword of judiKeywords) {
    if (lowerCaseText.includes(keyword)) {
      classification = "JUDI";
      confidenceScore = 0.7 + Math.random() * 0.29; // Skor acak antara 0.70 - 0.99 untuk JUDI
      break; // Hentikan loop jika keyword ditemukan
    }
  }

  // Placeholder untuk deteksi QR code (membutuhkan Computer Vision yang lebih canggih)
  // Untuk simulasi, jika teks menyebutkan QR, bisa dianggap relevan.
  // if (
  //   lowerCaseText.includes("qr code") ||
  //   lowerCaseText.includes("kode qr") ||
  //   lowerCaseText.includes("scan qr")
  // ) {
  //   // Keputusan apakah QR code selalu "JUDI" tergantung pada konteks aplikasi Anda.
  //   // Bisa jadi memerlukan analisis tambahan atau kategori sendiri.
  //   // Untuk simulasi, kita bisa asumsikan ini meningkatkan potensi "JUDI" atau menjadi kategori khusus.
  //   // classification = "JUDI";
  //   // confidenceScore = Math.max(confidenceScore, 0.80); // Tingkatkan confidence jika sudah JUDI, atau set jika belum
  //   console.log(
  //     `[AIService] Potensi QR code terdeteksi dalam teks untuk analisis lebih lanjut.`
  //   );
  // }

  // Log hasil analisis dari service AI dummy ini
  console.log(
    `[AIService] Hasil analisis untuk "${commentText.substring(
      0,
      50
    )}..." -> Klasifikasi: ${classification} (Skor Kepercayaan: ${confidenceScore.toFixed(
      3
    )})`
  );

  return {
    classification, // Akan "JUDI" atau "NON_JUDI"
    confidenceScore: parseFloat(confidenceScore.toFixed(3)), // Mengembalikan skor dengan 3 desimal
    modelVersion: "dummy-text-keyword-v0.1.0", // Versi model dummy
  };
};

module.exports = {
  analyzeCommentText,
};
