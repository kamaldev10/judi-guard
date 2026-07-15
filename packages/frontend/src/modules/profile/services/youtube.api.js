import apiClient from '@/shared/api-client/index.js';

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

export const getGoogleAuthUrl = async () => {
  try {
    const response = await apiClient.get('/auth/guest/connect');
    return response.data.data.url;
  } catch (error) {
    handleApiError(error, 'Gagal mendapatkan URL Login.');
  }
};

export const handleGoogleCallback = async (code) => {
  try {
    const response = await apiClient.get(`/auth/guest/callback?code=${code}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal verifikasi akun Google.');
  }
};

export const getConnectedChannelProfile = async () => {
  try {
    const response = await apiClient.get('/auth/youtube/profile');
    return response.data.data;
  } catch {
    return null;
  }
};

export const disconnectYoutubeGuest = async () => {
  try {
    await apiClient.post('/auth/guest/disconnect');
    return true;
  } catch (error) {
    handleApiError(error, 'Gagal memutuskan koneksi YouTube.');
  }
};
