import apiClient from '@/shared/api-client/index.js';

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

export const getWhitelist = async () => {
  try {
    const response = await apiClient.get('/config/whitelist');
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil whitelist.');
  }
};

export const addWhitelist = async (data) => {
  try {
    const response = await apiClient.post('/config/whitelist', data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal menambahkan channel ke whitelist.');
  }
};

export const deleteWhitelist = async (id) => {
  try {
    await apiClient.delete(`/config/whitelist/${id}`);
    return true;
  } catch (error) {
    handleApiError(error, 'Gagal menghapus channel dari whitelist.');
  }
};

export const getBlacklist = async () => {
  try {
    const response = await apiClient.get('/config/blacklist');
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil blacklist.');
  }
};

export const addBlacklist = async (data) => {
  try {
    const response = await apiClient.post('/config/blacklist', data);
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal menambahkan keyword ke blacklist.');
  }
};

export const deleteBlacklist = async (id) => {
  try {
    await apiClient.delete(`/config/blacklist/${id}`);
    return true;
  } catch (error) {
    handleApiError(error, 'Gagal menghapus keyword dari blacklist.');
  }
};
