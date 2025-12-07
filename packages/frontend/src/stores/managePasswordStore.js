// stores/useManagePasswordStore.js
import { create } from "zustand";
import {
  resetPasswordApi,
  changePasswordApi,
  forgotPasswordApi,
} from "@/lib/services/managePasswordApi";
import { useAuthStore } from "./authStore";

export const useManagePasswordStore = create((set, get) => ({
  isLoading: false,
  error: null,

  // Forgot Password
  forgotPassword: async (email) => {
    // Set loading state in authStore
    set({ isLoading: true, error: null });
    try {
      const data = await forgotPasswordApi(email);
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Reset Password
  resetPassword: async (token, newPassword, confirmNewPassword) => {
    set({ isLoading: true, error: null });
    try {
      const data = await resetPasswordApi(
        token,
        newPassword,
        confirmNewPassword
      );
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Change Password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      // Get state from authStore
      const { currentUser } = useAuthStore.getState();
      if (!currentUser?.id) throw new Error("Pengguna tidak ditemukan.");

      const data = await changePasswordApi(
        currentPassword,
        newPassword,
        confirmPassword
      );
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
