import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as profileApi from '../services/profile.api.js';
import { useAuthUiStore } from '../../auth/stores/auth-ui.store.js';

export const profileKeys = {
  all: ['profile'],
  user: () => [...profileKeys.all, 'user'],
  youtubeChannel: () => [...profileKeys.all, 'youtube-channel'],
};

export const useUserProfileQuery = () => {
  const setUser = useAuthUiStore((state) => state.setUser);
  return useQuery({
    queryKey: profileKeys.user(),
    queryFn: async () => {
      const user = await profileApi.getCurrentUser();
      if (user) {
        localStorage.setItem('judiGuardUser', JSON.stringify(user));
        setUser(user);
      }
      return user;
    },
    initialData: () => useAuthUiStore.getState().currentUser || undefined,
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthUiStore((state) => state.setUser);
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        localStorage.setItem('judiGuardUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: profileKeys.user() });
    },
  });
};

export const useDeleteAccountMutation = () => {
  const clearSession = useAuthUiStore((state) => state.clearSession);
  return useMutation({
    mutationFn: profileApi.deleteAccount,
    onSuccess: () => {
      clearSession();
    },
  });
};

export const useConnectYoutubeMutation = () => {
  return useMutation({
    mutationFn: profileApi.connectYoutube,
  });
};

export const useDisconnectYoutubeMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthUiStore((state) => state.setUser);
  return useMutation({
    mutationFn: profileApi.disconnectYoutube,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.user() });
      queryClient.invalidateQueries({ queryKey: profileKeys.youtubeChannel() });
      const currentUser = useAuthUiStore.getState().currentUser;
      if (currentUser) {
        const updated = {
          ...currentUser,
          youtubeChannelId: null,
          youtubeChannelName: null,
          youtubeChannelThumbnail: null,
        };
        localStorage.setItem('judiGuardUser', JSON.stringify(updated));
        setUser(updated);
      }
    },
  });
};
