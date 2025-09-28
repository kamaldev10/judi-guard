import { apiClient } from "../apiClient";

/**
 * Menganalisis sebuah teks dengan memanggil endpoint backend /text/predict.
 * @param {string} text - Teks yang akan dianalisis.
 * @returns {Promise<object>} Data hasil analisis dari backend.
 */
export const predictTextApi = async (text) => {
  try {
    const response = await apiClient.post("/text/predict", { text });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Terjadi kesalahan saat melakukan prediksi teks.";
    throw new Error(message);
  }
};
