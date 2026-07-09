import { apiClient } from './apiClient';

export const getHistoryApi = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/analysis/history', {
    params: {
      page,
      limit,
      _t: new Date().getTime(), // TRICK: Paksa data fresh (Anti-304 Cache)
    },
  });
  return response.data.data;
};

// API Baru: Preview JSON
export const getReportPreviewApi = async (startDate, endDate) => {
  const response = await apiClient.get('/analysis/report/preview', {
    params: { startDate, endDate },
  });
  return response.data.data;
};

// API Baru: Download PDF
export const downloadPeriodReportApi = async (startDate, endDate) => {
  const response = await apiClient.get('/analysis/report/download', {
    params: { startDate, endDate },
    responseType: 'blob',
  });
  return response.data;
};

// API lama: download laporan PDF per analysisId
export const downloadReportApi = async (analysisId) => {
  const response = await apiClient.get(`/analysis/${analysisId}/report/pdf`, {
    responseType: 'blob',
  });
  return response.data;
};
