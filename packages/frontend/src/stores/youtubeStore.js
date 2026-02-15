// stores/useYoutubeStore.js
import { create } from "zustand";
import {
  initiateYoutubeOAuthRedirectApi,
  disconnectYoutubeAccountApi,
  // new logic
  disconnectYoutubeApi,
  handleGoogleCallbackApi,
  getGoogleAuthUrlApi,
  getConnectedChannelProfileApi,
} from "@/lib/services/youtubeApi";
import { useUserStore } from "./userStore";

export const useYoutubeStore = create((set, get) => ({
  isLoading: false,
  error: null,
  channelProfile: null, // Akan berisi object { id, title, thumbnail }
  isConnected: false,
  isInitialized: false,

  // ---------------------- NEW LOGIC --------------------

  /**
   * 1. Cek Status Koneksi (Dipanggil saat Dashboard dimuat)
   * Mengambil profil channel jika ada sesi aktif.
   */
  fetchChannelProfile: async (force = false) => {
    const state = get();

    if (state.isLoading) return;

    if (state.channelProfile && !force) return;

    set({ isLoading: true, error: null });
    try {
      const profile = await getConnectedChannelProfileApi();
      if (profile) {
        set({
          channelProfile: profile,
          isConnected: true,
          isInitialized: true,
        });
      } else {
        set({ channelProfile: null, isConnected: false, isInitialized: true });
      }
    } catch (err) {
      // Silent error, anggap belum connect
      set({ channelProfile: null, isConnected: false, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 2. Mulai Proses Login Google
   * Mengambil URL dari backend lalu redirect browser user.
   */
  connectToGoogle: async () => {
    try {
      const url = await getGoogleAuthUrlApi();
      if (url) {
        // Redirect full page ke halaman login Google
        window.location.href = url;
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  /**
   * 3. Handle Callback dari Google
   * Dipanggil di halaman /auth/callback setelah user redirect balik dari Google.
   */
  handleCallback: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await handleGoogleCallbackApi(code);
      if (profile) {
        set({ channelProfile: profile, isConnected: true });
        return true; // Return success signal
      }
      return false;
    } catch (err) {
      set({ error: err.message, isConnected: false });
      throw err; // Lempar error agar bisa ditangkap UI untuk menampilkan Toast/Alert
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * 4. Disconnect Channel
   * Menghapus sesi YouTube (Guest Session).
   */
  disconnectChannel: async () => {
    set({ isLoading: true, error: null });
    try {
      await disconnectYoutubeApi();
      set({ channelProfile: null, isConnected: false });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },
  //  ----------------------------------------------

  // Connect YouTube
  connectYoutube: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await initiateYoutubeOAuthRedirectApi();
      return data; // Returns the { authorizationUrl }
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Disconnect YouTube
  disconnectYoutube: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await disconnectYoutubeAccountApi();

      // On success, refresh the user data in the authStore
      // to update connection status (e.g., isYoutubeConnected = false)
      await useUserStore.getState().refreshUser();

      return data; // Return success message
    } catch (err) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
