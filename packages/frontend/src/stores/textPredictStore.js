// src/store/textPredictStore.js
import { create } from "zustand";
import { predictTextApi } from "@/lib/services/predictTextApi";

/**
 * Mengimpor tipe dari paket bersama untuk konsistensi.
 * @typedef {import('@judiguard/common').PredictionResult} PredictionResult
 */

export const useTextPredictStore = create((set) => ({
  analyze: async (text) => {
    set({ isLoading: true, error: null, prediction: null });
    try {
      // Panggil API untuk mendapatkan hasil prediksi
      const response = await predictTextApi(text);
      set({ prediction: response.data, isLoading: false });
    } catch (err) {
      set({ error: "Gagal terhubung ke model AI.", isLoading: false });
      console.error(err);
    }
  },

  clear: () => {
    set({ prediction: null, error: null });
  },
}));
