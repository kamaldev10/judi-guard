import { create } from "zustand";
import { predictTextApi } from "@/services/api";

const useTextPredictStore = create((set) => ({
  prediction: null,
  isLoading: false,
  error: null,

  // action untuk analisis teks
  analyze: async (text) => {
    set({ isLoading: true, error: null, prediction: null });

    try {
      const result = await predictTextApi(text);
      set({ prediction: result.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  clear: () => set({ prediction: null, error: null }),
}));

export default useTextPredictStore;
