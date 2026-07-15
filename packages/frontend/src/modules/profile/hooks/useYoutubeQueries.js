import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as youtubeApi from '../services/youtube.api.js';
import { profileKeys } from './useProfileQueries.js';

export const useYoutubeChannelQuery = () => {
  return useQuery({
    queryKey: profileKeys.youtubeChannel(),
    queryFn: youtubeApi.getConnectedChannelProfile,
  });
};

export const useConnectGoogleMutation = () => {
  return useMutation({
    mutationFn: youtubeApi.getGoogleAuthUrl,
    onSuccess: (url) => {
      if (url) {
        window.location.href = url;
      }
    },
  });
};

export const useDisconnectYoutubeGuestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: youtubeApi.disconnectYoutubeGuest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.youtubeChannel() });
    },
  });
};
