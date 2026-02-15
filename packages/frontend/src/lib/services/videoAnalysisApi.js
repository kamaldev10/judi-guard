// src/services/api.js
import { apiClient } from "./apiClient";

//* ------------------------------- NEW LOGIC -----------------------------

/**
 * 1. Start Analysis (Fire & Forget)
 * POST /api/analysis/:videoId
 */
export const startAnalysisApi = async (videoId) => {
  const response = await apiClient.post(`/analysis/${videoId}`);
  // Returns: { analysisId, videoId, status: "PROCESSING", ticketCreated: true }
  return response.data.data;
};

/**
 * 2. Check Status (Polling)
 * GET /api/analysis/status/:analysisId
 */
export const getAnalysisStatusApi = async (analysisId) => {
  const response = await apiClient.get(`/analysis/status/${analysisId}`);
  // Returns: { status, totalCommentsFetched, totalSpamDetected, ... }
  return response.data.data;
};

/**
 * 3. Fetch Results (Pagination & Filter)
 * GET /api/analysis/:analysisId/results
 */
export const getAnalysisResultsApi = async (analysisId, params = {}) => {
  const response = await apiClient.get(`/analysis/${analysisId}/results`, {
    params: {
      ...params,
      _t: Date.now(),
    },
  });
  // Returns: { comments: [], pagination: {...} }
  return response.data.data;
};

/**
 * 4. Eksekusi Moderasi (Delete/Hold)
 * POST /api/analysis/:analysisId/action
 * Body: { commentIds: [], action: "DELETE", banAuthor: boolean }
 */
export const executeActionApi = async (analysisId, payload) => {
  const response = await apiClient.post(
    `/analysis/${analysisId}/action`,
    payload,
  );
  // Return: { message, data: { requested: 5, youtubeResult: ... } }
  return response.data;
};

/**
 * 5. Undo Moderasi (Restore)
 * POST /api/analysis/:analysisId/undo
 * Body: { commentIds: [] }
 */
export const undoActionApi = async (analysisId, commentIds) => {
  const response = await apiClient.post(`/analysis/${analysisId}/undo`, {
    commentIds,
  });
  return response.data;
};

// --- REPORTING ---

/**
 * 7. Download Laporan PDF
 * Penting: Harus set responseType 'blob' agar axios membacanya sebagai file binary.
 */
export const downloadReportPdfApi = async (analysisId) => {
  try {
    const response = await apiClient.get(`/analysis/${analysisId}/report/pdf`, {
      responseType: "blob", // KUNCI UTAMA DOWNLOAD FILE
    });

    // Langsung return blob datanya untuk diproses component download
    return response.data;
  } catch (error) {
    throw new Error("Gagal mengunduh laporan PDF.");
  }
};

//----------------------------------------------------------------

//submit video analysis
export const submitVideoForAnalysisApi = async (videoUrl) => {
  try {
    const response = await apiClient.post("/analysis/videos", { videoUrl });
    // response.data seharusnya adalah objek VideoAnalysis yang sudah diproses (atau minimal ID dan status awal)

    return response.data.data; // Asumsi backend mengembalikan { success: true, data: videoAnalysisObject }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Mengambil detail dan status dari sebuah VideoAnalysis.
 * Digunakan untuk polling jika analisis di backend bersifat asinkron.
 * Untuk V1 (sinkron), ini mungkin tidak terlalu dipakai untuk polling status analisis,
 * tapi berguna untuk mendapatkan update data VideoAnalysis.
 */
export const getVideoAnalysisApi = async (analysisId) => {
  try {
    const response = await apiClient.get(`/analysis/videos/${analysisId}`);
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: videoAnalysisObject }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Mengambil semua komentar yang telah dianalisis untuk sebuah VideoAnalysis.
 */
export const getAnalyzedCommentsApi = async (analysisId) => {
  try {
    const response = await apiClient.get(
      `/analysis/videos/${analysisId}/comments`,
    );
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: [arrayOfComments] }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Meminta penghapusan semua komentar "JUDI" untuk sebuah VideoAnalysis.
 * Untuk V1, kita asumsikan backend memproses ini secara sinkron.
 */
export const batchDeleteJudiCommentsApi = async (analysisId) => {
  try {
    const response = await apiClient.delete(
      `/analysis/videos/${analysisId}/judi-comments`,
    );
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: { summary } }
  } catch (error) {
    throw new Error(error);
  }
};

// Meminta penghapusan satu komentar spesifik.
export const deleteSingleCommentApi = async (analyzedCommentId) => {
  try {
    const response = await apiClient.delete(
      `/analysis/comments/${analyzedCommentId}`,
    );
    return response.data; // Asumsi backend mengembalikan { success: true, message: "..." }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Mengambil link moderasi komentar dari backend.
 * @param {string} analysisId - ID dari analisis yang sedang dilihat.
 * @returns {Promise<string>} URL ke YouTube Studio.
 */
export const getStudioLinkApi = async (analysisId) => {
  try {
    const response = await apiClient.get(`/studio/comments-link/${analysisId}`);
    return response.data.data.url;
  } catch (error) {
    const message =
      error.response?.data?.message || "Gagal mendapatkan link YouTube Studio.";
    throw new Error(message);
  }
};
