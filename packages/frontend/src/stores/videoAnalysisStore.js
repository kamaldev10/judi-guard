import { create } from "zustand";
import {
  submitVideoForAnalysisApi,
  getVideoAnalysisApi,
  getAnalyzedCommentsApi,
  batchDeleteJudiCommentsApi,
  deleteSingleCommentApi,
  getStudioLinkApi,
} from "@/lib/services/videoAnalysisApi";

export const useVideoAnalysisStore = create((set, get) => ({
  isLoadingAnalysis: false,
  error: null,
  currentAnalysis: null,
  analyzedComments: [],
  studioLink: null,

  // 🔁 Reset state
  resetAnalysis: () =>
    set({
      isLoadingAnalysis: false,
      error: null,
      currentAnalysis: null,
      analyzedComments: [],
      studioLink: null,
    }),

  // 🚀 Submit video untuk dianalisis
  submitVideoForAnalysis: async (videoUrl) => {
    set({ isLoadingAnalysis: true, error: null });
    try {
      const data = await submitVideoForAnalysisApi(videoUrl);
      set({ currentAnalysis: data });
      return data;
    } catch (err) {
      set({ error: err.message || "Gagal mengirim video untuk analisis." });
      throw err;
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },

  // 🔍 Ambil status/detail analisis tertentu
  fetchVideoAnalysis: async (analysisId) => {
    set({ isLoadingAnalysis: true, error: null });
    try {
      const data = await getVideoAnalysisApi(analysisId);
      set({ currentAnalysis: data });
      return data;
    } catch (err) {
      set({ error: err.message || "Gagal memuat data analisis video." });
      throw err;
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },

  // 💬 Ambil komentar yang sudah dianalisis
  fetchAnalyzedComments: async (analysisId) => {
    set({ isLoadingAnalysis: true, error: null });
    try {
      const comments = await getAnalyzedCommentsApi(analysisId);
      set({ analyzedComments: comments });
      return comments;
    } catch (err) {
      set({ error: err.message || "Gagal memuat komentar yang dianalisis." });
      throw err;
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },

  // 🗑️ Hapus semua komentar “JUDI”
  batchDeleteJudiComments: async (analysisId) => {
    set({ isLoadingAnalysis: true, error: null });
    try {
      const result = await batchDeleteJudiCommentsApi(analysisId);
      // Setelah delete, refresh komentar agar UI selalu konsisten
      await get().fetchAnalyzedComments(analysisId);
      return result;
    } catch (err) {
      set({ error: err.message || "Gagal menghapus komentar JUDI." });
      throw err;
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },

  // ❌ Hapus komentar tunggal
  deleteSingleComment: async (commentId, analysisId) => {
    set({ isLoadingAnalysis: true, error: null });
    try {
      const res = await deleteSingleCommentApi(commentId);
      // Refresh komentar agar state tetap sinkron
      await get().fetchAnalyzedComments(analysisId);
      return res;
    } catch (err) {
      set({ error: err.message || "Gagal menghapus komentar." });
      throw err;
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },

  // 🔗 Ambil link ke YouTube Studio
  fetchStudioLink: async (analysisId) => {
    set({ isLoadingAnalysis: true, error: null });
    try {
      const url = await getStudioLinkApi(analysisId);
      set({ studioLink: url });
      return url;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },
}));
