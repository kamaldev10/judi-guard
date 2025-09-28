import { create } from "zustand";
import { updateMyProfileApi, deleteMyAccountApi } from "@/lib/services";
import { useAuthStore } from "../auth/authStore";

export const useUserStore = create((set) => ({
  isLoadingUser: false,
  error: null,

  // Update Profile - Properly updates auth state after profile change
  updateProfile: async (profileData) => {
    set({ isLoadingUser: true, error: null });
    try {
      const res = await updateMyProfileApi(profileData);

      if (res?.status === "success" && res.data?.user) {
        //  Get current token from AuthStore and update session
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

  // Delete Account - Properly clears auth state after deletion
  deleteAccount: async () => {
    set({ isLoadingUser: true, error: null });
    try {
      const res = await deleteMyAccountApi();

      // Clear auth session after successful account deletion
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

  // Helper method to refresh user data (delegates to AuthStore)
  refreshUserData: async () => {
    const { refreshUser } = useAuthStore.getState();
    return await refreshUser();
  },

  // Clear user-specific errors
  clearError: () => {
    set({ error: null });
  },
}));
