//--------------------------NEW LOGIC------------------------------
import { create } from 'zustand';
import {
  startAnalysisApi,
  getAnalysisStatusApi,
  getAnalysisResultsApi,
  executeActionApi,
  undoActionApi,
} from '@/lib/services/videoAnalysisApi';
import { getMyVideosApi, searchVideoApi, getVideoCommentsApi } from '@/lib/services/channelApi'; // Import dari service baru
import { toast } from 'sonner';

export const useVideoAnalysisStore = create((set, get) => ({
  step: 'SELECTION', // 'SELECTION' | 'PREVIEW' | 'SCANNING' | 'RESULTS'

  // --- STATE DATA ---
  myVideos: [], // List video grid
  nextPageToken: null, // Pagination untuk load more
  selectedVideo: null, // Video yang dipilih untuk dianalisis
  previewComments: [], // Data komentar mentah (Preview)

  // --- Analysis State Data ---
  activeAnalysisId: null,
  analysisStatus: null, // "PROCESSING", "COMPLETED", "FAILED"
  analysisStats: null, // Stats from polling (totalFetched, etc.)
  comments: [], // Final results
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
    riskLevel: '',
    search: '',
  },

  // --- STATE LOADING ---
  isLoadingList: false, // Loading fetch my videos
  isSearching: false, // Loading search video
  isLoadingPreview: false, // Loading fetch comments
  isLoadingResults: false, // Active during result fetching
  isScanning: false, // Loading proses analisis

  // --- INITIATE ACTIONS ---

  // 1. Fetch Video Channel (Load Initial / Load More)
  fetchMyVideos: async (pageToken = '') => {
    const { isLoadingList } = get();
    if (isLoadingList) return; // guard clause dulu

    const isLoadMore = !!pageToken;
    set({ isLoadingList: true });

    try {
      const data = await getMyVideosApi(pageToken);

      set((state) => ({
        myVideos: isLoadMore ? [...state.myVideos, ...data.videos] : data.videos,
        nextPageToken: data.nextPageToken,
      }));
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat daftar video.');
    } finally {
      set({ isLoadingList: false });
    }
  },

  // 2. Search Video by URL/ID
  handleSearchVideo: async (query) => {
    if (!query) return;
    set({ isSearching: true });

    try {
      const videoData = await searchVideoApi(query);

      // Jika sukses, langsung masuk ke mode PREVIEW
      // Kita bungkus formatnya agar sama dengan struktur myVideos
      const formattedVideo = {
        id: videoData.id,
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        // ... field lain jika perlu untuk UI Preview
        statistics: videoData.statistics,
      };

      get().selectVideoForPreview(formattedVideo);
    } catch (err) {
      const msg = err.response?.data?.message || 'Video tidak ditemukan.';
      toast.error(msg);
    } finally {
      set({ isSearching: false });
    }
  },

  // 3. Select Video -> Pindah ke Step PREVIEW
  selectVideoForPreview: async (videoData) => {
    set({
      selectedVideo: videoData,
      step: 'PREVIEW',
      previewComments: [],
      isLoadingPreview: true,
    });

    try {
      // Langsung fetch komentar preview (batch pertama)
      const data = await getVideoCommentsApi(videoData.id); // Ingat pakai .id bukan .youtubeVideoId
      set({ previewComments: data.comments });
    } catch (err) {
      toast.error('Gagal memuat preview komentar.');
    } finally {
      set({ isLoadingPreview: false });
    }
  },

  // --- ANALYSIS ACTIONS  ---

  // 1. Start Analysis Process (Called from Preview UI)
  startAnalysisProcess: async () => {
    const { selectedVideo } = get();
    if (!selectedVideo) return;

    // Move to Scanning UI
    set({ step: 'SCANNING', isScanning: true, error: null });

    try {
      // Call Backend to create ticket
      const ticket = await startAnalysisApi(selectedVideo.id); // Use .id from selection

      set({
        activeAnalysisId: ticket.analysisId,
        analysisStatus: 'PROCESSING',
      });

      // Start Polling
      get().startPolling(ticket.analysisId);
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memulai analisis.';
      set({ error: msg, isScanning: false, step: 'PREVIEW' });
      toast.error(msg);
    }
  },

  // 2. Polling Logic (Recursive)
  startPolling: async (analysisId) => {
    try {
      const statusData = await getAnalysisStatusApi(analysisId);

      set({
        analysisStatus: statusData.status,
        analysisStats: statusData, // Update UI with progress (e.g. totalCommentsFetched)
      });

      if (statusData.status === 'COMPLETED') {
        // SUCCESS: Move to Results
        set({ isScanning: false, step: 'RESULTS' });
        toast.success('Analisis Selesai!');
        get().fetchResults(); // Load initial results
      } else if (statusData.status === 'FAILED') {
        // FAIL: Show Error
        set({ isScanning: false, error: statusData.errorMessage });
        toast.error(`Analisis Gagal: ${statusData.errorMessage}`);
      } else {
        // STILL PROCESSING: Retry in 2s
        if (get().step === 'SCANNING') {
          // Guard clause if user navigated away
          setTimeout(() => get().startPolling(analysisId), 2000);
        }
      }
    } catch (err) {
      console.warn('Polling error, retrying...', err);
      // Retry on network glitch
      setTimeout(() => get().startPolling(analysisId), 3000);
    }
  },

  cancelScanning: () => {
    // Kembalikan ke step PREVIEW agar user bisa coba lagi atau pilih video lain
    set({
      step: 'PREVIEW',
      isScanning: false,
      error: null,
      activeAnalysisId: null, // Reset ID agar tidak polling lagi
    });
  },

  // 3. Fetch Final Results
  fetchResults: async (customParams = {}) => {
    const { activeAnalysisId, filters, isLoadingResults } = get();
    set({ isLoadingResults: true });
    if (isLoadingResults) return;

    if (!activeAnalysisId) return;

    // Merge current filters with new params
    const queryParams = { ...filters, ...customParams };

    try {
      const data = await getAnalysisResultsApi(activeAnalysisId, queryParams);

      set({
        comments: data.comments,
        pagination: data.pagination,
        filters: queryParams,
      });
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat hasil komentar.');
    } finally {
      set({ isLoadingResults: false });
    }
  },

  // --- MODERATION ACTION ---

  // 1. Eksekusi Hapus/Tahan (Mendukung Ban Author)
  executeCleanup: async (selectedIds, banAuthor = false) => {
    const { activeAnalysisId } = get();
    if (!activeAnalysisId) return;

    set({ isExecuting: true });
    try {
      const result = await executeActionApi(activeAnalysisId, {
        commentIds: selectedIds,
        action: 'DELETE', // Backend Anda support DELETE/HOLD
        banAuthor: banAuthor,
      });

      // Refresh data agar status di tabel berubah jadi "Dihapus"
      await get().fetchResults();

      return true; // Signal success
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus komentar';
      toast.error(msg);
      return false;
    } finally {
      set({ isExecuting: false });
    }
  },

  // 2. Eksekusi Undo (Restore)
  executeUndo: async (selectedIds) => {
    const { activeAnalysisId } = get();
    if (!activeAnalysisId) return; // Pastikan ID Analisis ada

    set({ isExecuting: true });
    try {
      await undoActionApi(activeAnalysisId, selectedIds);

      await get().fetchResults();

      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengembalikan komentar';
      toast.error(msg); // Tampilkan error jika gagal
      throw err; // Throw agar toast.promise di UI tahu ini gagal
    } finally {
      set({ isExecuting: false });
    }
  },

  // Helper: Filter
  setFilter: (key, value) => {
    // Reset to page 1 when changing filters
    get().fetchResults({ [key]: value, page: 1 });
  },

  setPage: (page) => {
    get().fetchResults({ page });
  },

  // Navigation Helper
  resetToSelection: () => {
    set({ step: 'SELECTION', activeAnalysisId: null, comments: [] });
  },
}));

//-----------------------------------------------------------------

// import { create } from "zustand";
// import {
//   submitVideoForAnalysisApi,
//   getVideoAnalysisApi,
//   getAnalyzedCommentsApi,
//   batchDeleteJudiCommentsApi,
//   deleteSingleCommentApi,
//   getStudioLinkApi,
// } from "@/lib/services/videoAnalysisApi";

// export const useVideoAnalysisStore = create((set, get) => ({
//   isLoadingAnalysis: false,
//   error: null,
//   currentAnalysis: null,
//   analyzedComments: [],
//   studioLink: null,

//   // 🔁 Reset state
//   resetAnalysis: () =>
//     set({
//       isLoadingAnalysis: false,
//       error: null,
//       currentAnalysis: null,
//       analyzedComments: [],
//       studioLink: null,
//     }),

//   // 🚀 Submit video untuk dianalisis
//   submitVideoForAnalysis: async (videoUrl) => {
//     set({ isLoadingAnalysis: true, error: null });
//     try {
//       const data = await submitVideoForAnalysisApi(videoUrl);
//       set({ currentAnalysis: data });
//       return data;
//     } catch (err) {
//       set({ error: err.message || "Gagal mengirim video untuk analisis." });
//       throw err;
//     } finally {
//       set({ isLoadingAnalysis: false });
//     }
//   },

//   // 🔍 Ambil status/detail analisis tertentu
//   fetchVideoAnalysis: async (analysisId) => {
//     set({ isLoadingAnalysis: true, error: null });
//     try {
//       const data = await getVideoAnalysisApi(analysisId);
//       set({ currentAnalysis: data });
//       return data;
//     } catch (err) {
//       set({ error: err.message || "Gagal memuat data analisis video." });
//       throw err;
//     } finally {
//       set({ isLoadingAnalysis: false });
//     }
//   },

//   // 💬 Ambil komentar yang sudah dianalisis
//   fetchAnalyzedComments: async (analysisId) => {
//     set({ isLoadingAnalysis: true, error: null });
//     try {
//       const comments = await getAnalyzedCommentsApi(analysisId);
//       set({ analyzedComments: comments });
//       return comments;
//     } catch (err) {
//       set({ error: err.message || "Gagal memuat komentar yang dianalisis." });
//       throw err;
//     } finally {
//       set({ isLoadingAnalysis: false });
//     }
//   },

//   // 🗑️ Hapus semua komentar “JUDI”
//   batchDeleteJudiComments: async (analysisId) => {
//     set({ isLoadingAnalysis: true, error: null });
//     try {
//       const result = await batchDeleteJudiCommentsApi(analysisId);
//       // Setelah delete, refresh komentar agar UI selalu konsisten
//       await get().fetchAnalyzedComments(analysisId);
//       return result;
//     } catch (err) {
//       set({ error: err.message || "Gagal menghapus komentar JUDI." });
//       throw err;
//     } finally {
//       set({ isLoadingAnalysis: false });
//     }
//   },

//   // ❌ Hapus komentar tunggal
//   deleteSingleComment: async (commentId, analysisId) => {
//     set({ isLoadingAnalysis: true, error: null });
//     try {
//       const res = await deleteSingleCommentApi(commentId);
//       // Refresh komentar agar state tetap sinkron
//       await get().fetchAnalyzedComments(analysisId);
//       return res;
//     } catch (err) {
//       set({ error: err.message || "Gagal menghapus komentar." });
//       throw err;
//     } finally {
//       set({ isLoadingAnalysis: false });
//     }
//   },

//   // 🔗 Ambil link ke YouTube Studio
//   fetchStudioLink: async (analysisId) => {
//     set({ isLoadingAnalysis: true, error: null });
//     try {
//       const url = await getStudioLinkApi(analysisId);
//       set({ studioLink: url });
//       return url;
//     } catch (err) {
//       set({ error: err.message });
//       throw err;
//     } finally {
//       set({ isLoadingAnalysis: false });
//     }
//   },
// }));
