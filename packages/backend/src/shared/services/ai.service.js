import { mlApiClient } from '#shared/clients/ml-api.client.js';
import { AppError } from '#shared/utils/errors.js';
import config from '#config/environment.js';
import { DEFAULT_GAMBLING_KEYWORDS } from '#shared/constants/gambling-keywords.js';
import { VideoAnalysisRepository } from '#modules/video-analysis/video-analysis.repository.js';
import { AnalyzedCommentRepository } from '#modules/video-analysis/analyzed-comment.repository.js';
import {
  WhitelistRepository,
  BlacklistRepository,
} from '#modules/configuration/configuration.repository.js';

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
  const authorChannelId = commentData.commentAuthorChannelId;
  const textLower = text.toLowerCase();

  let indicators = {
    hasPhoneNumber: false,
    hasLink: false,
    hasGamblingKeywords: false,
    isWhitelisted: false,
  };
  let reasons = [];
  let totalScore = 0;

  // ---CEK WHITELIST USER ---
  // Jika penulis ada di whitelist, abaikan semua indikator spam.
  if (userWhitelist.has(authorChannelId)) {
    return {
      classification: 'NON_JUDI',
      confidenceScore: 0,
      spamIndicators: { ...indicators, isWhitelisted: true },
      riskLevel: 'NONE',
      detectedKeywords: ['User Whitelist (Trusted Account)'],
      processingStatus: 'PROCESSED',
      aiModelVersion: config.aiModelVersion,
    };
  }

  // --- LOGIKA AI & SCORING ---
  // Hitung Base Score dari AI
  if (aiClassification === 'JUDI') {
    totalScore += aiConfidence * 100;
  }

  // Cek Blacklist (Gabungan Default + User Custom)
  const allKeywords = [...BASE_RULES.DEFAULT_GAMBLING_KEYWORDS, ...userBlacklist];

  const foundKeywords = allKeywords.filter((word) => textLower.includes(word));

  if (foundKeywords.length > 0) {
    indicators.hasGamblingKeywords = true;
    reasons.push(`Blacklist: ${foundKeywords.slice(0, 3).join(', ')}`);
    totalScore += BASE_RULES.WEIGHTS.BLACKLIST;
  }

  // Cek Regex (Phone & Link)
  if (BASE_RULES.PHONE_PATTERN.test(text)) {
    indicators.hasPhoneNumber = true;
    reasons.push('Mengandung Nomor Telepon');
    totalScore += BASE_RULES.WEIGHTS.PHONE;
  }

  if (BASE_RULES.LINK_PATTERN.test(text)) {
    indicators.hasLink = true;
    reasons.push('Mengandung Tautan Eksternal');
    totalScore += BASE_RULES.WEIGHTS.LINK;
  }

  // --- PENENTUAN FINAL ---
  let finalClassification = aiClassification;
  let riskLevel = 'NONE';

  // Override: Jika skor tinggi (kena blacklist/regex) walau AI bilang aman -> Paksa JUDI
  if (finalClassification === 'NON_JUDI' && totalScore >= 100) {
    finalClassification = 'JUDI';
    reasons.push('Override: Terdeteksi Indikator Berat');
  }

  // Tentukan Risk Level
  if (finalClassification === 'JUDI') {
    if (totalScore >= 100) {
      riskLevel = 'HIGH';
    } else if (totalScore >= 80) {
      riskLevel = 'MEDIUM';
    } else if (totalScore >= 50) {
      riskLevel = 'LOW';
    } else {
      riskLevel = 'NONE';
      finalClassification = 'NON_JUDI';
    }

    if (finalClassification === 'JUDI' && reasons.length === 0) {
      reasons.push(`Terdeteksi Semantik AI (${Math.round(aiConfidence * 100)}%)`);
    }
  }

  return {
    classification: finalClassification,
    confidenceScore: aiConfidence,
    spamIndicators: indicators,
    riskLevel: riskLevel,
    detectedKeywords: reasons,
    processingStatus: 'PROCESSED',
    aiModelVersion: config.aiModelVersion,
  };
};

const runAiClassification = async (analysisId) => {
  try {
    console.log(`[AI Service] Memulai klasifikasi untuk Analysis ID: ${analysisId}`);

    const analysisRecord = await VideoAnalysisRepository.findById(analysisId);
    if (!analysisRecord) throw new Error('Data analisis tidak ditemukan.');

    const userId = analysisRecord.userId;

    let userBlacklist = [];
    let userWhitelist = new Set();

    if (userId) {
      const blDocs = await BlacklistRepository.findByUserId(userId);
      userBlacklist = blDocs.map((d) => d.keyword.toLowerCase());

      const wlDocs = await WhitelistRepository.findByUserId(userId);
      wlDocs.forEach((d) => userWhitelist.add(d.channelId));

      // console.log(
      //   `[AI Service] User Config Loaded: ${userBlacklist.length} Blacklist words, ${userWhitelist.size} Whitelisted channels.`,
      // );
    }

    const commentsToAnalyze = await AnalyzedCommentRepository.find({
      analysisId: analysisId,
      processingStatus: 'UNPROCESSED',
    }).select('_id commentTextOriginal commentAuthorChannelId');

    if (commentsToAnalyze.length === 0) {
      console.log('[AI Service] Tidak ada komentar baru untuk dianalisis.');
      return;
    }

    // Siapkan Payload ke Python (Hanya ID dan Teks)
    const payload = {
      comments: commentsToAnalyze.map((c) => ({
        id: c._id.toString(),
        text: c.commentTextOriginal,
      })),
    };

    // console.log(
    //   `[AI Service] Mengirim ${payload.comments.length} komentar ke ML API...`,
    // );

    const response = await mlApiClient.post('/api/analyze', payload);
    const { results } = response.data;

    if (!results || !Array.isArray(results)) {
      throw new Error('Format respons ML API tidak valid.');
    }

    // Mapping Data Asli agar bisa dicek Whitelist/Blacklist
    const commentMap = {};
    commentsToAnalyze.forEach((c) => {
      commentMap[c._id.toString()] = c;
    });

    // Gabungkan Hasil AI + Config User
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
              processingStatus: 'PROCESSED',
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

    // Eksekusi Bulk Write
    if (bulkOps.length > 0) {
      await AnalyzedCommentRepository.bulkWrite(bulkOps);
    }

    // Update Statistik Header
    const processedIds = results.map((r) => r.id);
    const finalSpamCount = await AnalyzedCommentRepository.countDocuments({
      _id: { $in: processedIds },
      classification: 'JUDI',
    });

    const moderationStatus = finalSpamCount > 0 ? 'NONE' : 'CLEANED';

    await VideoAnalysisRepository.findByIdAndUpdate(analysisId, {
      $inc: {
        totalCommentsAnalyzed: commentsToAnalyze.length,
        totalSpamDetected: finalSpamCount,
      },
      $set: { moderationStatus: moderationStatus },
    });

    // console.log(
    //   `[AI Service] Sukses. Spam terdeteksi (Batch ini): ${finalSpamCount}`,
    // );
  } catch (error) {
    console.error('[AI Service] Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      throw new AppError('Layanan AI sedang tidak tersedia.', 503);
    }
    throw error;
  }
};

const analyzeTextWithAI = async (text) => {
  if (!text || typeof text !== 'string') {
    throw new AppError('Text harus berupa string.', 400);
  }

  try {
    const response = await mlApiClient.post('/api/predict', {
      text,
    });

    const data = response.data;

    return {
      classification: data.classification,
      confidenceScore: data.confidenceScore,
      modelVersion: config.aiModelVersion,
    };
  } catch (error) {
    console.error('[AI Service] analyzeTextWithAI:', error.message);

    if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
      throw new AppError('Layanan AI sedang tidak tersedia.', 503);
    }

    // Map status code from ML API ke Frontend
    if (error.response) {
      throw new AppError(
        error.response.data?.message || 'Terjadi kesalahan pada layanan AI.',
        error.response.status,
      );
    }

    throw new AppError('Gagal terhubung ke layanan AI.', 500);
  }
};

export { runAiClassification, analyzeTextWithAI };
