import { apiClient } from './apiClient';

/**
 * Menganalisis sebuah teks dengan memanggil endpoint backend /predict.
 * @param {string} text - Teks yang akan dianalisis.
 * @returns {Promise<object>} Data hasil analisis dari backend.
 */
export const predictTextApi = async (text) => {
  try {
    const res = await apiClient.post('/predict', { text });
    return res.data;
  } catch (error) {
    console.error('❌ Error dari backend:', error.response?.data || error.message);

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      `Gagal memanggil server AI: ${error.message}`;

    throw new Error(message);
  }
};
