import { create } from "zustand";
import {
  loginUserApi,
  registerUserApi,
  signInWithGoogleApi,
  verifyOtpApi,
  resendOtpApi,
  forgotPasswordApi,
  resetPasswordApi,
  changePasswordApi,
} from "@/lib/services";
import { getCurrentUserApi } from "@/lib/services/user/userApi";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("judiGuardToken") || null,
  isLoadingAuth: false,
  error: null,
  currentUser: JSON.parse(localStorage.getItem("judiGuardUser") || "null"),

  // Computed property untuk authentication status
  get isAuthenticated() {
    const state = get();
    return !!(state.token && state.currentUser);
  },

  // helper simpan session
  setSession: (user, token) => {
    if (token) localStorage.setItem("judiGuardToken", token);
    localStorage.setItem("judiGuardUser", JSON.stringify(user));
    set({ currentUser: user, token });
  },

  // helper hapus session
  clearSession: () => {
    localStorage.removeItem("judiGuardToken");
    localStorage.removeItem("judiGuardUser");
    set({ currentUser: null, token: null });
  },

  // refreshUser - Proper implementation in AuthStore
  refreshUser: async () => {
    const currentToken = get().token || localStorage.getItem("judiGuardToken");

    if (!currentToken) {
      get().clearSession();
      return null;
    }

    set({ isLoadingAuth: true, error: null });
    try {
      const res = await getCurrentUserApi();

      if (res?.status === "success" && res.data?.user) {
        // Update session dengan user data terbaru
        get().setSession(res.data.user, currentToken);
        return res.data.user;
      } else {
        // Response tidak valid, clear session
        get().clearSession();
        return null;
      }
    } catch (err) {
      console.warn("[AuthStore] refreshUser gagal:", err.message);

      // Jika error 401/403, kemungkinan token expired
      if (err.response?.status === 401 || err.response?.status === 403) {
        get().clearSession();
      }

      set({ error: err.message });
      return null;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoadingAuth: true, error: null });
    try {
      return await registerUserApi(userData);
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
      if (res?.data?.user && res?.data?.token) {
        get().setSession(res.data.user, res.data.token);
      }
      return res;
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Google Sign In
  signInWithGoogle: async (idToken) => {
    set({ isLoadingAuth: true, error: null });
    try {
      const res = await signInWithGoogleApi(idToken);
      if (res?.data?.user && res?.data?.token) {
        get().setSession(res.data.user, res.data.token);
      }
      return res;
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

  // ✅ Verify Session - Uses refreshUser properly
  verifyUserSession: async () => {
    const token = localStorage.getItem("judiGuardToken");
    if (!token) {
      set({ currentUser: null, isLoadingAuth: false });
      return;
    }

    // Use refreshUser to validate token and get latest user data
    await get().refreshUser();
  },

  // OTP & Password methods
  verifyOtp: (email, otp) => verifyOtpApi(email, otp),
  resendOtp: (email) => resendOtpApi(email),
  forgotPassword: (email) => forgotPasswordApi(email),
  resetPassword: (token, newPassword) => resetPasswordApi(token, newPassword),
  changePassword: (currentPassword, newPassword) =>
    changePasswordApi(currentPassword, newPassword),
}));
