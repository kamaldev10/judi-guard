// stores/authStore.js
import { create } from 'zustand';
import {
  loginUserApi,
  registerUserApi,
  resendOtpApi,
  signInWithGoogleApi,
  verifyOtpApi,
} from '@/lib/services/authApi';
import { getCurrentUserApi } from '@/lib/services/userApi';

// Helper: Parse Cookie secara manual (tanpa install js-cookie)
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('judiGuardToken') || null,
  currentUser: JSON.parse(localStorage.getItem('judiGuardUser') || 'null'),
  isLoadingAuth: false,
  sessionType: null, // 'member' | 'guest' | null
  error: null,
  setUser: (user) => set({ currentUser: user }),

  getSession: () => {
    set({ isLoadingAuth: true });
    try {
      // 1. Cek User Member (LocalStorage)
      const localUserStr = localStorage.getItem('judiGuardUser');
      const localToken = localStorage.getItem('judiGuardToken');

      if (localUserStr && localToken) {
        const userObj = JSON.parse(localUserStr);

        // Mapping data Member
        set({
          currentUser: userObj,
          token: localToken,
          isAuthenticated: true,
          sessionType: 'member',
          isLoadingAuth: false,
        });
        return; // Prioritas Member ditemukan, stop di sini.
      }

      // 2. Cek Guest Session (Cookies)
      const guestCookieStr = getCookie('guest_session');

      if (guestCookieStr) {
        // Decode URL encoded cookie string jika perlu (biasanya cookie raw sudah string JSON)
        const decodedCookie = decodeURIComponent(guestCookieStr);
        const guestObj = JSON.parse(decodedCookie);

        // Validasi struktur guest (pastikan ada tokens dan channel)
        if (guestObj.tokens && guestObj.channel) {
          // Mapping Guest seolah-olah User agar UI konsisten
          const guestUser = {
            _id: 'guest_' + guestObj.channel.id,
            username: guestObj.channel.title || 'Guest',
            email: 'guest@judiguard.com',
            youtubeChannelId: guestObj.channel.id,
            youtubeChannelName: guestObj.channel.title,
            avatar: guestObj.channel.thumbnail,
            isGuest: true,
            isYoutubeConnected: true, // Guest pasti connect YT
          };

          set({
            currentUser: guestUser,
            token: guestObj.tokens.access_token, // Pakai token YT sebagai session token sementara
            isAuthenticated: true,
            sessionType: 'guest',
            isLoadingAuth: false,
          });
          return;
        }
      }

      // 3. Jika tidak ada keduanya
      set({
        currentUser: null,
        token: null,
        isAuthenticated: false,
        sessionType: null,
        isLoadingAuth: false,
      });
    } catch (err) {
      console.error('[AuthStore] Gagal parsing session:', err);
      set({
        currentUser: null,
        isAuthenticated: false,
        isLoadingAuth: false,
      });
    }
  },

  getIsAuthenticated() {
    const state = get();
    return !!(state.token && state.currentUser);
  },

  refreshUserProfile: async () => {
    try {
      // Panggil API untuk dapatkan data user terbaru dari DB
      // Pastikan backend punya endpoint GET /auth/me yang return user object
      const response = await getCurrentUserApi();

      const updatedUser = response.data.user; // Sesuaikan struktur response backend Anda

      // Update State
      set({ currentUser: updatedUser });

      // Update LocalStorage agar saat refresh page data tetap baru
      localStorage.setItem('judiGuardUser', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      console.error('Gagal refresh profil:', err);
    }
  },

  // Helpers
  setSession: (user, token) => {
    // Clean password
    const { password, ...userToStore } = user;
    if (token) localStorage.setItem('judiGuardToken', token);
    localStorage.setItem('judiGuardUser', JSON.stringify(userToStore));
    set({ currentUser: userToStore, token, isAuthenticated: true });
  },

  clearSession: () => {
    localStorage.removeItem('judiGuardToken');
    localStorage.removeItem('judiGuardUser');
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
      if (!data?.user || !data?.token) {
        throw new Error('Respons dari server tidak lengkap');
      }
      get().setSession(data.user, data.token);
      return data;
    } catch (err) {
      const errorMessage = err?.data?.data?.message || err.message;
      set({ error: errorMessage });
      throw err;
    } finally {
      set({ isLoadingAuth: false });
    }
  },

  // Logout
  logout: () => {
    console.log('[AuthStore] Logout dipanggil');
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
