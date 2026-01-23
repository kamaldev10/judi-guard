// packages/backend/src/api/services/ai.service.js
const mlApiClient = require("../../core/mlApiClient");
const AnalyzedComment = require("../models/AnalyzedComment.model");
const VideoAnalysis = require("../models/VideoAnalysis.model");
const { AppError } = require("../../utils/errors");
const config = require("../../config/environment");

// --- 1. DEFINISI RULES & BOBOT (WEIGHTS) ---
// Bobot menentukan seberapa parah indikator tersebut.
const RULES = {
  PHONE_PATTERN: /(\+62|62|08)\d{8,}/,
  LINK_PATTERN: /(https?:\/\/[^\s]+|wa\.me\/|t\.me\/|bit\.ly\/|s\.id\/)/,

  // Blacklist: Kata yang hampir pasti digunakan oleh bot judi
  GAMBLING_KEYWORDS: [
    "gacor",
    "slot",
    "maxwin",
    "sensasional",
    "jackpot",
    "wd",
    "depo",
    "togel",
    "olympus",
    "zeus",
    "pragmatic",
    "scatter",
    "petir",
    "pola",
    "rungkad",
  ],

  // Bobot Skor
  WEIGHTS: {
    BLACKLIST: 100, // Langsung Auto High Risk
    PHONE: 40, // Indikator Kuat
    LINK: 30, // Indikator Sedang (bisa jadi link tugas/sah)
  },
};

/**
 * --- 2. LOGIC HYBRID WEIGHTED SCORING ---
 * Menggabungkan Probabilitas AI + Deterministik Regex
 */
const enrichPrediction = (text, aiClassification, aiConfidence) => {
  let indicators = {
    hasPhoneNumber: false,
    hasLink: false,
    hasGamblingKeywords: false,
  };
  let reasons = [];
  let totalScore = 0;

  const textLower = text.toLowerCase();

  // A. Hitung Base Score dari AI (Probabilistic)
  // Jika AI mendeteksi JUDI, kita ambil persentase keyakinannya sebagai skor awal.
  // Contoh: Confidence 0.95 = 95 Poin.
  if (aiClassification === "JUDI") {
    totalScore += aiConfidence * 100;
  }

  // B. Tambahkan Skor dari Indikator (Deterministic)

  // 1. Cek Blacklist (Bobot: 100)
  const foundKeywords = RULES.GAMBLING_KEYWORDS.filter((word) =>
    textLower.includes(word),
  );
  if (foundKeywords.length > 0) {
    indicators.hasGamblingKeywords = true;
    reasons.push(`Kata Kunci Terlarang: ${foundKeywords.join(", ")}`);
    totalScore += RULES.WEIGHTS.BLACKLIST;
  }

  // 2. Cek Nomor Telepon (Bobot: 40)
  if (RULES.PHONE_PATTERN.test(text)) {
    indicators.hasPhoneNumber = true;
    reasons.push("Mengandung Nomor Telepon");
    totalScore += RULES.WEIGHTS.PHONE;
  }

  // 3. Cek Link (Bobot: 30)
  if (RULES.LINK_PATTERN.test(text)) {
    indicators.hasLink = true;
    reasons.push("Mengandung Tautan Eksternal");
    totalScore += RULES.WEIGHTS.LINK;
  }

  // C. Penentuan Final Classification & Risk Level
  let finalClassification = aiClassification;
  let riskLevel = "NONE";

  // LOGIC OVERRIDE:
  // Jika AI bilang NON_JUDI, tapi skor > 100 (karena ada Blacklist Word),
  // kita paksa ubah jadi JUDI. Safety Net!
  if (finalClassification === "NON_JUDI" && totalScore >= 100) {
    finalClassification = "JUDI";
    reasons.push("Override: Terdeteksi Indikator Berat");
  }

  // Penentuan Risk Level Berdasarkan Total Score
  if (finalClassification === "JUDI") {
    if (totalScore >= 100) {
      riskLevel = "HIGH"; // Hampir pasti spam (Gabungan AI + Rule atau Blacklist)
    } else if (totalScore >= 80) {
      riskLevel = "MEDIUM"; // AI sangat yakin atau AI ragu tapi ada link
    } else if (totalScore >= 50) {
      riskLevel = "LOW"; // AI yakin tapi confidence rendah & tanpa bukti lain
    } else {
      // Skor < 50, anggap NONE (AI halusinasi / false positive lemah)
      riskLevel = "NONE";
      finalClassification = "NON_JUDI";
    }

    // Jika masuk kategori judi tapi belum ada alasan spesifik (hanya semantik)
    if (finalClassification === "JUDI" && reasons.length === 0) {
      reasons.push(
        `Terdeteksi Semantik AI (${Math.round(aiConfidence * 100)}%)`,
      );
    }
  }

  return {
    classification: finalClassification === "JUDI" ? "JUDI" : "NON_JUDI", // Pastikan Uppercase sesuai Enum
    confidenceScore: aiConfidence,
    spamIndicators: indicators,
    riskLevel: riskLevel,
    detectedKeywords: reasons,
    processingStatus: "PROCESSED",
    aiModelVersion: config.aiModelVersion,
  };
};

/**
 * --- 3. FUNGSI EKSEKUSI UTAMA ---
 */
const runAiClassification = async (analysisId) => {
  try {
    console.log(
      `[AI Service] Memulai klasifikasi untuk Analysis ID: ${analysisId}`,
    );

    // 1. Ambil komentar 'UNPROCESSED'
    // Gunakan nama field yang benar: 'commentTextOriginal'
    const commentsToAnalyze = await AnalyzedComment.find({
      analysisId: analysisId,
      processingStatus: "UNPROCESSED",
    }).select("_id commentTextOriginal");

    if (commentsToAnalyze.length === 0) {
      console.log("[AI Service] Tidak ada komentar baru untuk dianalisis.");
      return;
    }

    // 2. Siapkan Payload untuk Python
    const payload = {
      comments: commentsToAnalyze.map((c) => ({
        id: c._id.toString(),
        text: c.commentTextOriginal,
      })),
    };

    console.log(
      `[AI Service] Mengirim ${payload.comments.length} komentar ke ML API...`,
    );

    // 3. Panggil API Python
    const response = await mlApiClient.post("/api/analyze", payload);
    const { results } = response.data; // [{id, classification, confidenceScore}, ...]

    if (!results || !Array.isArray(results)) {
      throw new Error("Format respons ML API tidak valid.");
    }

    // 4. Map Teks Asli untuk Enrichment
    const textMap = {};
    commentsToAnalyze.forEach((c) => {
      textMap[c._id.toString()] = c.commentTextOriginal;
    });

    // 5. Gabungkan Hasil AI + Logic Hybrid
    const bulkOps = results.map((res) => {
      const originalText = textMap[res.id];
      const enriched = enrichPrediction(
        originalText,
        res.classification,
        res.confidenceScore,
      );

      return {
        updateOne: {
          filter: { _id: res.id },
          update: {
            $set: {
              processingStatus: "PROCESSED",
              classification: enriched.classification, // JUDI / NON_JUDI
              confidenceScore: enriched.confidenceScore,
              spamIndicators: enriched.spamIndicators,
              riskLevel: enriched.riskLevel,
              detectedKeywords: enriched.detectedKeywords,
              aiModelVersion: enriched.aiModelVersion,
            },
          },
        },
      };
    });

    // 6. Eksekusi Bulk Write
    if (bulkOps.length > 0) {
      await AnalyzedComment.bulkWrite(bulkOps);
    }

    // 7. Hitung Statistik Akhir untuk Header VideoAnalysis
    // Kita hitung yang status akhirnya JUDI
    const processedIds = results.map((r) => r.id);
    const finalSpamCount = await AnalyzedComment.countDocuments({
      _id: { $in: processedIds },
      classification: "JUDI",
    });

    const moderationStatus = finalSpamCount > 0 ? "NONE" : "CLEANED";

    // Update Header (Increment total, bukan replace, agar aman jika batching)
    await VideoAnalysis.findByIdAndUpdate(analysisId, {
      $inc: {
        totalCommentsAnalyzed: commentsToAnalyze.length,
        totalSpamDetected: finalSpamCount,
      },
      $set: { moderationStatus: moderationStatus },
    });

    console.log(
      `[AI Service] Sukses. Spam terdeteksi (Batch ini): ${finalSpamCount}`,
    );
  } catch (error) {
    console.error("[AI Service] Error:", error.message);
    if (error.code === "ECONNREFUSED" || error.response?.status >= 500) {
      throw new AppError("Layanan AI sedang tidak tersedia.", 503);
    }
    throw error;
  }
};

module.exports = {
  runAiClassification,
};
