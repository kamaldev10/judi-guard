import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as configApi from '../services/config.api.js';

export const configKeys = {
  all: ['config'],
  whitelist: () => [...configKeys.all, 'whitelist'],
  blacklist: () => [...configKeys.all, 'blacklist'],
};

export const useWhitelistQuery = () => {
  return useQuery({
    queryKey: configKeys.whitelist(),
    queryFn: configApi.getWhitelist,
  });
};

export const useAddWhitelistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configApi.addWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.whitelist() });
    },
  });
};

export const useDeleteWhitelistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configApi.deleteWhitelist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.whitelist() });
    },
  });
};

export const useBlacklistQuery = () => {
  return useQuery({
    queryKey: configKeys.blacklist(),
    queryFn: configApi.getBlacklist,
  });
};

export const useAddBlacklistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configApi.addBlacklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.blacklist() });
    },
  });
};

export const useDeleteBlacklistMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: configApi.deleteBlacklist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.blacklist() });
    },
  });
};
