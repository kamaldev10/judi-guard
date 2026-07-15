import { useQuery, useMutation } from '@tanstack/react-query';
import * as historyApi from '../services/history.api.js';

export const historyKeys = {
  all: ['history'],
  list: (page, limit) => [...historyKeys.all, 'list', { page, limit }],
  reportPreview: (startDate, endDate) => [
    ...historyKeys.all,
    'report-preview',
    { startDate, endDate },
  ],
};

export const useHistoryQuery = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: historyKeys.list(page, limit),
    queryFn: () => historyApi.getHistory(page, limit),
  });
};

export const useReportPreviewQuery = (dateRange, enabled = false) => {
  const startDate = dateRange?.from;
  const endDate = dateRange?.to;

  return useQuery({
    queryKey: historyKeys.reportPreview(startDate, endDate),
    queryFn: () => historyApi.getReportPreview(startDate, endDate),
    enabled: enabled && !!startDate && !!endDate,
  });
};

export const useDownloadPeriodReportMutation = () => {
  return useMutation({
    mutationFn: ({ startDate, endDate }) => historyApi.downloadPeriodReport(startDate, endDate),
  });
};

export const useDownloadReportMutation = () => {
  return useMutation({
    mutationFn: ({ analysisId }) => historyApi.downloadReport(analysisId),
  });
};
