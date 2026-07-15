import { create } from 'zustand';

export const useAnalysisUiStore = create((set) => ({
  step: 'SELECTION', // 'SELECTION' | 'PREVIEW' | 'SCANNING' | 'RESULTS'
  selectedVideo: null,
  activeAnalysisId: null,
  analysisStatus: null,
  analysisStats: null,
  filters: {
    page: 1,
    limit: 10,
    riskLevel: '',
    search: '',
  },

  setStep: (step) => set({ step }),
  setSelectedVideo: (video) => set({ selectedVideo: video }),
  setActiveAnalysisId: (id) => set({ activeAnalysisId: id }),
  setAnalysisStatus: (status) => set({ analysisStatus: status }),
  setAnalysisStats: (stats) => set({ analysisStats: stats }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
        page: 1, // Reset to page 1 on filter change
      },
    })),

  setPage: (page) =>
    set((state) => ({
      filters: {
        ...state.filters,
        page,
      },
    })),

  resetToSelection: () =>
    set({
      step: 'SELECTION',
      selectedVideo: null,
      activeAnalysisId: null,
      analysisStatus: null,
      analysisStats: null,
      filters: {
        page: 1,
        limit: 10,
        riskLevel: '',
        search: '',
      },
    }),

  reset: () =>
    set({
      step: 'SELECTION',
      selectedVideo: null,
      activeAnalysisId: null,
      analysisStatus: null,
      analysisStats: null,
      filters: {
        page: 1,
        limit: 10,
        riskLevel: '',
        search: '',
      },
    }),
}));
