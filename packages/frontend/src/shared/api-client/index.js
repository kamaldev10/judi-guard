import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config) => {
    // Inject JWT token
    const token = localStorage.getItem('judiGuardToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Inject active workspace ID (Fase 2 / 3)
    const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
    if (activeWorkspaceId) {
      config.headers['X-Workspace-Id'] = activeWorkspaceId;
    }

    return config;
  },
  (error) => {
    console.error('[API Client Request Error]', error);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto-logout on 401 — expired/invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem('judiGuardToken');
      localStorage.removeItem('activeWorkspaceId');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
