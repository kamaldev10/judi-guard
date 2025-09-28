// src/store/textPredictStore.js
import { create } from "zustand";
import { predictTextApi } from "@/lib/services";

/**
 * Mengimpor tipe dari paket bersama untuk konsistensi.
 * @typedef {import('@judiguard/common').PredictionResult} PredictionResult
 */

export const useTextPredictStore = create((set) => ({
  /** @type {PredictionResult | null} */
  prediction: null,
  /** @type {boolean} */
  isLoading: false,
  /** @type {string | null} */
  error: null,

  /**
   * Menganalisis teks dengan memanggil API.
   * @param {string} text - Teks yang akan dianalisis.
   * @returns {Promise<void>}
   */
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

  /**
   * Membersihkan hasil prediksi dan error.
   */
  clear: () => {
    set({ prediction: null, error: null });
  },
}));
