import apiClient from '@/shared/api-client/index.js';

export const predictText = async (text) => {
  try {
    const res = await apiClient.post('/predict', { text });
    return res.data.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      `Gagal memanggil server AI: ${error.message}`;
    throw new Error(message);
  }
};
