// packages/backend/src/api/services/ai.service.js
const mlApiClient = require("../../core/mlApiClient");
const AnalyzedComment = require("../models/AnalyzedComment.model");
const VideoAnalysis = require("../models/VideoAnalysis.model");
const { Whitelist, Blacklist } = require("../models/UserConfig.model");
const { AppError } = require("../../utils/errors");
const config = require("../../config/environment");

const DEFAULT_GAMBLING_KEYWORDS = require("../constants/spamKeywords");

// --- 1. DEFINISI RULES DASAR ---
const BASE_RULES = {
  PHONE_PATTERN: /(\+62|62|08)\d{8,}/,
  LINK_PATTERN: /(https?:\/\/[^\s]+|wa\.me\/|t\.me\/|bit\.ly\/|s\.id\/)/,

  DEFAULT_GAMBLING_KEYWORDS: DEFAULT_GAMBLING_KEYWORDS,

  WEIGHTS: {
    BLACKLIST: 100,
    PHONE: 40,
    LINK: 30,
  },
};

/**
 * --- 2. LOGIC HYBRID + USER CONFIG ---
 * Menerima data User Config (Whitelist/Blacklist) dari parameter
 */
const enrichPrediction = (
  commentData,
  aiClassification,
  aiConfidence,
  userBlacklist,
  userWhitelist,
) => {
  const text = commentData.commentTextOriginal;
  const authorChannelId = commentData.commentAuthorChannelId; // ID Channel Penulis
  const textLower = text.toLowerCase();

  let indicators = {
    hasPhoneNumber: false,
    hasLink: false,
    hasGamblingKeywords: false,
    isWhitelisted: false,
  };
  let reasons = [];
  let totalScore = 0;

  // --- PRIORITAS 1: CEK WHITELIST USER ---
  // Jika penulis ada di whitelist, abaikan semua indikator spam.
  if (userWhitelist.has(authorChannelId)) {
    return {
      classification: "NON_JUDI",
      confidenceScore: 0,
      spamIndicators: { ...indicators, isWhitelisted: true },
      riskLevel: "NONE",
      detectedKeywords: ["User Whitelist (Trusted Account)"],
      processingStatus: "PROCESSED",
      aiModelVersion: config.aiModelVersion,
    };
  }

  // --- PRIORITAS 2: LOGIKA AI & SCORING ---

  // A. Hitung Base Score dari AI
  if (aiClassification === "JUDI") {
    totalScore += aiConfidence * 100;
  }

  // B. Cek Blacklist (Gabungan Default + User Custom)
  const allKeywords = [
    ...BASE_RULES.DEFAULT_GAMBLING_KEYWORDS,
    ...userBlacklist,
  ];

  // Cari match
  const foundKeywords = allKeywords.filter((word) => textLower.includes(word));

  if (foundKeywords.length > 0) {
    indicators.hasGamblingKeywords = true;
    // Tampilkan max 3 keyword agar reason tidak kepanjangan
    reasons.push(`Blacklist: ${foundKeywords.slice(0, 3).join(", ")}`);
    totalScore += BASE_RULES.WEIGHTS.BLACKLIST;
  }

  // C. Cek Regex (Phone & Link)
  if (BASE_RULES.PHONE_PATTERN.test(text)) {
    indicators.hasPhoneNumber = true;
    reasons.push("Mengandung Nomor Telepon");
    totalScore += BASE_RULES.WEIGHTS.PHONE;
  }

  if (BASE_RULES.LINK_PATTERN.test(text)) {
    indicators.hasLink = true;
    reasons.push("Mengandung Tautan Eksternal");
    totalScore += BASE_RULES.WEIGHTS.LINK;
  }

  // --- PRIORITAS 3: PENENTUAN FINAL ---
  let finalClassification = aiClassification;
  let riskLevel = "NONE";

  // Override: Jika skor tinggi (kena blacklist/regex) walau AI bilang aman -> Paksa JUDI
  if (finalClassification === "NON_JUDI" && totalScore >= 100) {
    finalClassification = "JUDI";
    reasons.push("Override: Terdeteksi Indikator Berat");
  }

  // Tentukan Risk Level
  if (finalClassification === "JUDI") {
    if (totalScore >= 100) {
      riskLevel = "HIGH";
    } else if (totalScore >= 80) {
      riskLevel = "MEDIUM";
    } else if (totalScore >= 50) {
      riskLevel = "LOW";
    } else {
      riskLevel = "NONE";
      finalClassification = "NON_JUDI";
    }

    if (finalClassification === "JUDI" && reasons.length === 0) {
      reasons.push(
        `Terdeteksi Semantik AI (${Math.round(aiConfidence * 100)}%)`,
      );
    }
  }

  return {
    classification: finalClassification,
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

    // 1. Ambil Data Analisis untuk mengetahui User ID
    const analysisRecord = await VideoAnalysis.findById(analysisId);
    if (!analysisRecord) throw new Error("Data analisis tidak ditemukan.");

    const userId = analysisRecord.userId; // Bisa null jika Guest

    // 2. FETCH KONFIGURASI USER (Whitelist & Blacklist)
    let userBlacklist = [];
    let userWhitelist = new Set(); // Set untuk pencarian O(1)

    // Hanya fetch jika bukan Guest
    if (userId) {
      // Ambil Blacklist Custom
      const blDocs = await Blacklist.find({ userId }).select("keyword");
      userBlacklist = blDocs.map((d) => d.keyword.toLowerCase());

      // Ambil Whitelist Custom
      const wlDocs = await Whitelist.find({ userId }).select("channelId");
      wlDocs.forEach((d) => userWhitelist.add(d.channelId));

      console.log(
        `[AI Service] User Config Loaded: ${userBlacklist.length} Blacklist words, ${userWhitelist.size} Whitelisted channels.`,
      );
    }

    // 3. Ambil Komentar (Tambahkan field commentAuthorChannelId)
    const commentsToAnalyze = await AnalyzedComment.find({
      analysisId: analysisId,
      processingStatus: "UNPROCESSED",
    }).select("_id commentTextOriginal commentAuthorChannelId"); // <--- PENTING: Ambil ID Author

    if (commentsToAnalyze.length === 0) {
      console.log("[AI Service] Tidak ada komentar baru untuk dianalisis.");
      return;
    }

    // 4. Siapkan Payload ke Python (Hanya ID dan Teks)
    const payload = {
      comments: commentsToAnalyze.map((c) => ({
        id: c._id.toString(),
        text: c.commentTextOriginal,
      })),
    };

    console.log(
      `[AI Service] Mengirim ${payload.comments.length} komentar ke ML API...`,
    );

    // 5. Panggil API Python
    const response = await mlApiClient.post("/api/analyze", payload);
    const { results } = response.data;

    if (!results || !Array.isArray(results)) {
      throw new Error("Format respons ML API tidak valid.");
    }

    // 6. Mapping Data Asli agar bisa dicek Whitelist/Blacklist
    const commentMap = {};
    commentsToAnalyze.forEach((c) => {
      commentMap[c._id.toString()] = c; // Simpan object lengkap (text + authorId)
    });

    // 7. Gabungkan Hasil AI + Config User
    const bulkOps = results.map((res) => {
      const originalData = commentMap[res.id];

      // PASSING CONFIG USER KE SINI
      const enriched = enrichPrediction(
        originalData,
        res.classification,
        res.confidenceScore,
        userBlacklist,
        userWhitelist,
      );

      return {
        updateOne: {
          filter: { _id: res.id },
          update: {
            $set: {
              processingStatus: "PROCESSED",
              classification: enriched.classification,
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

    // 8. Eksekusi Bulk Write
    if (bulkOps.length > 0) {
      await AnalyzedComment.bulkWrite(bulkOps);
    }

    // 9. Update Statistik Header
    const processedIds = results.map((r) => r.id);
    const finalSpamCount = await AnalyzedComment.countDocuments({
      _id: { $in: processedIds },
      classification: "JUDI",
    });

    const moderationStatus = finalSpamCount > 0 ? "NONE" : "CLEANED";

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
