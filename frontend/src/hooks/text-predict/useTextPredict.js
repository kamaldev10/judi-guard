import { useState } from "react";
import { predictTextApi } from "../../services/api";

/**
 * Custom hook untuk mengelola state dan logika analisis teks.
 */
export const useTextPredict = () => {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fungsi untuk memulai proses analisis.
   * @param {string} text - Teks yang akan dianalisis.
   */
  const analyze = async (text) => {
    // Reset state sebelum memulai
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // 2. Panggil fungsi API yang sudah diperbaiki. Cukup kirim 'text'.
      const result = await predictTextApi(text);

      // 3. Simpan data hasil prediksi ke dalam state.
      // Backend Anda mengembalikan { status, message, data: {...} }, jadi kita ambil `result.data`.
      setPrediction(result.data);
    } catch (err) {
      // Jika terjadi error (dilempar dari api.js), simpan pesan errornya
      setError(err.message);
    } finally {
      // Set loading kembali ke false setelah selesai
      setIsLoading(false);
    }
  };

  // Kembalikan state dan fungsi agar bisa digunakan oleh komponen
  return { prediction, isLoading, error, analyze };
};
