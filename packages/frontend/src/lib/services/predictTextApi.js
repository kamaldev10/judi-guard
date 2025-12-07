import { apiClient } from "./apiClient";

/**
 * Menganalisis sebuah teks dengan memanggil endpoint backend /text/predict.
 * @param {string} text - Teks yang akan dianalisis.
 * @returns {Promise<object>} Data hasil analisis dari backend.
 */
export const predictTextApi = async (text) => {
  try {
    const res = await apiClient.post("/text/predict", { text });
    return res.data;
  } catch (error) {
    console.error("❌ Error dari backend:", error.res?.data || error.message);

    const message =
      error.res?.data?.message ||
      error.res?.data?.error ||
      `Gagal memanggil server AI: ${error.message}`;

    throw new Error(message);
  }
};
