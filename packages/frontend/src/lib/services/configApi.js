import { apiClient } from './apiClient';

// --- WHITELIST (Channel Aman) ---

export const getWhitelistApi = async () => {
  const response = await apiClient.get('/config/whitelist');
  return response.data.data;
};

export const addWhitelistApi = async (data) => {
  // data: { channelId: "@gadgetin", note: "Channel Tech" }
  const response = await apiClient.post('/config/whitelist', data);
  return response.data.data;
};

export const deleteWhitelistApi = async (id) => {
  await apiClient.delete(`/config/whitelist/${id}`);
  return true;
};

// --- BLACKLIST (Kata Terlarang) ---

export const getBlacklistApi = async () => {
  const response = await apiClient.get('/config/blacklist');
  return response.data.data;
};

export const addBlacklistApi = async (data) => {
  // data: { keyword: "slot gacor" } atau array untuk bulk
  const response = await apiClient.post('/config/blacklist', data);
  return response.data.data;
};

export const deleteBlacklistApi = async (id) => {
  await apiClient.delete(`/config/blacklist/${id}`);
  return true;
};
