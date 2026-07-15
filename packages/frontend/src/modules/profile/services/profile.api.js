import apiClient from '@/shared/api-client/index.js';

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response.data.data.user;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil profil pengguna.');
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await apiClient.patch('/users/updateMe', data);
    return response.data.data.user;
  } catch (error) {
    handleApiError(error, 'Gagal memperbarui profil pengguna.');
  }
};

export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/users/deleteMe');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal menghapus akun.');
  }
};

export const connectYoutube = async () => {
  try {
    const response = await apiClient.get('/auth/youtube/connect');
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal memulai koneksi ke YouTube.');
  }
};

export const disconnectYoutube = async () => {
  try {
    const response = await apiClient.post('/auth/youtube/disconnect');
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal memutuskan hubungan YouTube.');
  }
};
