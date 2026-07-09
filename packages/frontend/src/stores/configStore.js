import { create } from 'zustand';
import {
  getWhitelistApi,
  addWhitelistApi,
  deleteWhitelistApi,
  getBlacklistApi,
  addBlacklistApi,
  deleteBlacklistApi,
} from '@/lib/services/configApi';

export const useConfigStore = create((set, get) => ({
  whitelist: [],
  blacklist: [],

  // Pisahkan loading agar tidak bentrok
  isLoadingWhitelist: false,
  isLoadingBlacklist: false,

  isSubmitting: false,
  error: null,

  // Flag penanda apakah data sudah pernah dimuat (Cache)
  isWhitelistLoaded: false,
  isBlacklistLoaded: false,

  // --- ACTIONS WHITELIST ---
  fetchWhitelist: async (force = false) => {
    const state = get();

    // 1. CEGAH FETCH DUPLIKAT
    // Jika sedang loading, ATAU (data sudah ada DAN tidak dipaksa refresh) -> STOP
    if (state.isLoadingWhitelist) return;
    if (state.isWhitelistLoaded && !force) return;

    set({ isLoadingWhitelist: true, error: null });
    try {
      const data = await getWhitelistApi();
      set({ whitelist: data, isWhitelistLoaded: true });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoadingWhitelist: false });
    }
  },

  addToWhitelist: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      // Backend mengharapkan body: { channelId, channelName, note }
      // Pastikan service addWhitelistApi mengirim data ini apa adanya
      const newItem = await addWhitelistApi(data);

      set((state) => ({ whitelist: [newItem, ...state.whitelist] }));
      return newItem;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan whitelist';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isSubmitting: false });
    }
  },

  removeFromWhitelist: async (id) => {
    const oldList = get().whitelist;
    set((state) => ({
      whitelist: state.whitelist.filter((item) => item._id !== id),
    }));
    try {
      await deleteWhitelistApi(id);
    } catch (err) {
      set({ whitelist: oldList });
      throw err;
    }
  },

  // --- ACTIONS BLACKLIST ---
  fetchBlacklist: async (force = false) => {
    const state = get();

    // 1. CEGAH FETCH DUPLIKAT
    if (state.isLoadingBlacklist) return;
    if (state.isBlacklistLoaded && !force) return;

    set({ isLoadingBlacklist: true, error: null });
    try {
      const data = await getBlacklistApi();
      set({ blacklist: data, isBlacklistLoaded: true });
    } catch (err) {
      console.error(err);
    } finally {
      set({ isLoadingBlacklist: false });
    }
  },

  addToBlacklist: async (keyword) => {
    set({ isSubmitting: true, error: null });
    try {
      const report = await addBlacklistApi({ keyword });

      // Jika ada penambahan baru, kita FORCE refresh agar dapat ID terbaru
      if (report.added && report.added.length > 0) {
        await get().fetchBlacklist(true); // <--- True artinya paksa ambil baru
      }

      return report;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan blacklist';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isSubmitting: false });
    }
  },

  removeFromBlacklist: async (id) => {
    const oldList = get().blacklist;
    set((state) => ({
      blacklist: state.blacklist.filter((item) => item._id !== id),
    }));
    try {
      await deleteBlacklistApi(id);
    } catch (err) {
      set({ blacklist: oldList });
      throw err;
    }
  },
}));
