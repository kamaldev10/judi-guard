// stores/authStore.js
import { create } from "zustand";
import {
  loginUserApi,
  registerUserApi,
  resendOtpApi,
  signInWithGoogleApi,
  verifyOtpApi,
} from "@/lib/services/authApi";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("judiGuardToken") || null,
  currentUser: JSON.parse(localStorage.getItem("judiGuardUser") || "null"),
  isLoadingAuth: false,
  error: null,
  setUser: (user) => set({ currentUser: user }),

  get isAuthenticated() {
    const state = get();
    return !!(state.token && state.currentUser);
  },

  // Helpers
  setSession: (user, token) => {
    // Clean password
    const { password, ...userToStore } = user;
    if (token) localStorage.setItem("judiGuardToken", token);
    localStorage.setItem("judiGuardUser", JSON.stringify(userToStore));
    set({ currentUser: userToStore, token, isAuthenticated: true });
  },

  clearSession: () => {
    localStorage.removeItem("judiGuardToken");
    localStorage.removeItem("judiGuardUser");
    set({ currentUser: null, token: null, isAuthenticated: false });
  },

  // Register
  register: async (userData) => {
    set({ isLoadingAuth: true, error: null });
    try {
      const data = await registerUserApi(userData);
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoadingAuth: true, error: null });
    try {
      const res = await loginUserApi(credentials);
      const user = res?.data?.user;
      const token = res?.data?.token;

      if (user && token) {
        get().setSession(user, token);
      }
      return res;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Google Sign-in
  signInWithGoogle: async (idToken) => {
    set({ isLoadingAuth: true, error: null });
    try {
      const data = await signInWithGoogleApi(idToken);
      if (data?.user && data?.token) {
        get().setSession(data.user, data.token);
      }
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Logout
  logout: () => {
    console.log("[AuthStore] Logout dipanggil");
    get().clearSession();
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    set({ isLoadingAuth: true, error: null });
    try {
      const data = await verifyOtpApi(email, otp);
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    set({ isLoadingAuth: true, error: null });
    try {
      const data = await resendOtpApi(email);
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },
}));
