import apiClient from '@/shared/api-client/index.js';

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

export const getHistory = async (page = 1, limit = 10) => {
  try {
    const response = await apiClient.get('/analysis/history', {
      params: {
        page,
        limit,
        _t: new Date().getTime(),
      },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal memuat riwayat.');
  }
};

export const getReportPreview = async (startDate, endDate) => {
  try {
    const response = await apiClient.get('/analysis/report/preview', {
      params: { startDate, endDate },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal memuat preview laporan.');
  }
};

export const downloadPeriodReport = async (startDate, endDate) => {
  try {
    const response = await apiClient.get('/analysis/report/download', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengunduh laporan PDF.');
  }
};

export const downloadReport = async (analysisId) => {
  try {
    const response = await apiClient.get(`/analysis/${analysisId}/report/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengunduh laporan PDF.');
  }
};
