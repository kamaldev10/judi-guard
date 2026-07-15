import apiClient from '@/shared/api-client/index.js';

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

export const getMyVideos = async (pageToken = '') => {
  try {
    const response = await apiClient.get('/videos', {
      params: { pageToken },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil daftar video channel.');
  }
};

export const searchVideo = async (query) => {
  try {
    const response = await apiClient.get('/videos/search', {
      params: { query },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mencari video.');
  }
};

export const getVideoComments = async (videoId, pageToken = '') => {
  try {
    const response = await apiClient.get(`/videos/${videoId}/comments`, {
      params: { pageToken },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil komentar video.');
  }
};

export const startAnalysis = async (videoId) => {
  try {
    const response = await apiClient.post(`/analysis/${videoId}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal memulai analisis video.');
  }
};

export const getAnalysisStatus = async (analysisId) => {
  try {
    const response = await apiClient.get(`/analysis/status/${analysisId}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil status analisis.');
  }
};

export const getAnalysisResults = async (analysisId, params = {}) => {
  try {
    const response = await apiClient.get(`/analysis/${analysisId}/results`, {
      params: {
        ...params,
        _t: Date.now(),
      },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengambil hasil analisis.');
  }
};

export const executeAction = async (analysisId, payload) => {
  try {
    const response = await apiClient.post(`/analysis/${analysisId}/action`, payload);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengeksekusi aksi moderasi.');
  }
};

export const undoAction = async (analysisId, commentIds) => {
  try {
    const response = await apiClient.post(`/analysis/${analysisId}/undo`, { commentIds });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal membatalkan aksi moderasi.');
  }
};

export const downloadReportPdf = async (analysisId) => {
  try {
    const response = await apiClient.get(`/analysis/${analysisId}/report/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengunduh laporan PDF.');
  }
};

export const getStudioLink = async (analysisId) => {
  try {
    const response = await apiClient.get(`/studio/comments-link/${analysisId}`);
    return response.data.data.url;
  } catch (error) {
    handleApiError(error, 'Gagal mendapatkan link YouTube Studio.');
  }
};
