import { apiClient } from "./apiClient";

/**
 * 1. Ambil Daftar Video Channel Saya (Grid Video)
 * GET /api/videos?pageToken=...
 */
export const getMyVideosApi = async (pageToken = "") => {
  const response = await apiClient.get("/videos", {
    params: { pageToken },
  });
  // Return struktur: { videos: [], nextPageToken, totalResults }
  return response.data.data;
};

/**
 * 2. Search Video By ID/Link
 * GET /api/videos/search?query=...
 */
export const searchVideoApi = async (query) => {
  const response = await apiClient.get("/videos/search", {
    params: { query },
  });
  // Return single video object
  return response.data.data;
};

/**
 * 3. Ambil Preview Komentar
 * GET /api/videos/:videoId/comments?pageToken=...
 */
export const getVideoCommentsApi = async (videoId, pageToken = "") => {
  const response = await apiClient.get(`/videos/${videoId}/comments`, {
    params: { pageToken },
  });
  // Return: { comments: [], nextPageToken }
  return response.data.data;
};
