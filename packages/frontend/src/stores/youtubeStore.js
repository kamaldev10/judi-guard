// stores/useYoutubeStore.js
import { create } from "zustand";
import {
  initiateYoutubeOAuthRedirectApi,
  disconnectYoutubeAccountApi,
} from "@/lib/services/youtubeApi";
import { useUserStore } from "./userStore";

export const useYoutubeStore = create((set, get) => ({
  isLoading: false,
  error: null,

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
