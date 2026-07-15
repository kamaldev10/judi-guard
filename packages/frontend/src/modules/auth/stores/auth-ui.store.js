import { create } from 'zustand';

const readInitialSession = () => {
  const accessToken = localStorage.getItem('accessToken') || null;
  const refreshToken = localStorage.getItem('refreshToken') || null;
  const currentUser = JSON.parse(localStorage.getItem('judiGuardUser') || 'null');
  return {
    accessToken,
    refreshToken,
    currentUser,
    isAuthenticated: !!(accessToken && currentUser),
  };
};

export const useAuthUiStore = create((set, get) => ({
  ...readInitialSession(),
  isLoadingAuth: false,
  error: null,

  setUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),

  getSession: () => {
    set({ isLoadingAuth: true });
    try {
      const localUserStr = localStorage.getItem('judiGuardUser');
      const localToken = localStorage.getItem('accessToken');

      if (localUserStr && localToken) {
        const userObj = JSON.parse(localUserStr);
        set({
          currentUser: userObj,
          accessToken: localToken,
          isAuthenticated: true,
          isLoadingAuth: false,
        });
        return;
      }

      set({
        currentUser: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoadingAuth: false,
      });
    } catch (err) {
      console.error('[AuthUiStore] Gagal parsing session:', err);
      set({
        currentUser: null,
        isAuthenticated: false,
        isLoadingAuth: false,
      });
    }
  },

  getIsAuthenticated: () => {
    const state = get();
    return !!(state.accessToken && state.currentUser);
  },

  // ponytail: token + user disimpan di localStorage, cookie-based guest dihapus
  setSession: (user, accessToken, refreshToken) => {
    const { password: _password, ...userToStore } = user;
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('judiGuardUser', JSON.stringify(userToStore));
    set({ currentUser: userToStore, accessToken, refreshToken, isAuthenticated: true });
  },

  clearSession: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('judiGuardUser');
    localStorage.removeItem('activeWorkspaceId');
    set({
      currentUser: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  // ponytail: logout server-side dipanggil dari mutation, bukan dari sini
  logout: () => {
    get().clearSession();
  },
}));
