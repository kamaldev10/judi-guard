import { create } from 'zustand';
import { updateMyProfileApi, deleteMyAccountApi, getCurrentUserApi } from '@/lib/services/userApi';
import { useAuthStore } from './authStore';

export const useUserStore = create((set) => ({
  isLoadingUser: false,
  error: null,

  /**
   * 🔹 Get Current User
   * Fetch user data dari endpoint /users/me
   * dan sinkronkan dengan AuthStore jika berhasil.
   */
  getCurrentUser: async () => {
    set({ isLoadingUser: true, error: null });
    try {
      const res = await getCurrentUserApi();

      if (res?.status === 'success' && res.data?.user) {
        // Update auth store jika data user valid
        const { token, setSession } = useAuthStore.getState();
        if (token) {
          setSession(res.data.user, token);
        }
      }

      return res;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingUser: false });
    }
  },

  // Refresh user session
  refreshUser: async () => {
    const token = useAuthStore.getState().token || localStorage.getItem('judiGuardToken');
    if (!token) {
      useAuthStore.getState().clearSession();
      return null;
    }

    set({ isLoadingUser: true, error: null });
    try {
      const res = await getCurrentUserApi();
      if (res?.status === 'success' && res.data?.user) {
        useAuthStore.getState().setSession(res.data.user, token); // Use the existing token
        return res.data.user;
      }
      useAuthStore.getState().clearSession();
      return null;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        useAuthStore.getState().clearSession();
      }
      set({ error: err.message });
      return null;
    } finally {
      set({ isLoadingUser: false });
    }
  },

  /**
   * 🔹 Update Profile
   * Update profil dan sinkronkan dengan AuthStore.
   */
  updateProfile: async (profileData) => {
    set({ isLoadingUser: true, error: null });
    try {
      const res = await updateMyProfileApi(profileData);

      if (res?.status === 'success' && res.data?.user) {
        const { token, setSession } = useAuthStore.getState();
        if (token) {
          setSession(res.data.user, token);
        }
      }

      return res;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingUser: false });
    }
  },

  /**
   * 🔹 Delete Account
   * Hapus akun dan logout dari AuthStore.
   */
  deleteAccount: async () => {
    set({ isLoadingUser: true, error: null });
    try {
      const res = await deleteMyAccountApi();
      const { logout } = useAuthStore.getState();
      logout();
      return res;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingUser: false });
    }
  },

  /**
   * 🔹 Clear Error State
   */
  clearError: () => set({ error: null }),
}));
