import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as analysisApi from '../services/analysis.api.js';

export const useMyVideos = () => {
  const [pageToken, setPageToken] = useState('');
  const [accumulatedVideos, setAccumulatedVideos] = useState([]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['my-videos', pageToken],
    queryFn: () => analysisApi.getMyVideos(pageToken),
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (data?.videos) {
      setAccumulatedVideos((prev) => {
        if (!pageToken) {
          return data.videos; // Reset list if pageToken is empty (first load)
        }
        const existingIds = new Set(prev.map((v) => v.id));
        const newVideos = data.videos.filter((v) => !existingIds.has(v.id));
        return [...prev, ...newVideos];
      });
    }
  }, [data, pageToken]);

  return {
    myVideos: accumulatedVideos,
    isLoadingList: isLoading || isFetching,
    nextPageToken: data?.nextPageToken,
    fetchMyVideos: (nextPage = '') => {
      setPageToken(nextPage);
    },
  };
};

export const useSearchVideoMutation = () => {
  return useMutation({
    mutationFn: analysisApi.searchVideo,
  });
};

export const useVideoCommentsQuery = (videoId) => {
  return useQuery({
    queryKey: ['video-comments', videoId],
    queryFn: () => analysisApi.getVideoComments(videoId),
    enabled: !!videoId,
  });
};

export const useStartAnalysisMutation = () => {
  return useMutation({
    mutationFn: analysisApi.startAnalysis,
  });
};

export const useAnalysisStatusQuery = (analysisId, options = {}) => {
  return useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => analysisApi.getAnalysisStatus(analysisId),
    enabled: !!analysisId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    ...options,
  });
};

export const useAnalysisResultsQuery = (analysisId, filters) => {
  return useQuery({
    queryKey: ['analysis-results', analysisId, filters],
    queryFn: () => analysisApi.getAnalysisResults(analysisId, filters),
    enabled: !!analysisId,
    placeholderData: (previousData) => previousData,
  });
};

export const useExecuteActionMutation = () => {
  return useMutation({
    mutationFn: ({ analysisId, payload }) => analysisApi.executeAction(analysisId, payload),
  });
};

export const useUndoActionMutation = () => {
  return useMutation({
    mutationFn: ({ analysisId, commentIds }) => analysisApi.undoAction(analysisId, commentIds),
  });
};

export const useStudioLinkQuery = (analysisId) => {
  return useQuery({
    queryKey: ['studio-link', analysisId],
    queryFn: () => analysisApi.getStudioLink(analysisId),
    enabled: !!analysisId,
  });
};
