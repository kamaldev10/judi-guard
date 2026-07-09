import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useUserStore } from '../userStore';
import { useAuthStore } from '../authStore';

import { updateMyProfileApi, deleteMyAccountApi, getCurrentUserApi } from '@/lib/services/userApi';

// --- 1. Mock External Dependencies ---

// Mock all imported API services
vi.mock('@/lib/services/userApi', () => ({
  updateMyProfileApi: vi.fn(),
  deleteMyAccountApi: vi.fn(),
  getCurrentUserApi: vi.fn(),
}));

// Mock the authStore
// Create mock functions for authStore actions
const mockSetSession = vi.fn();
const mockLogout = vi.fn();
const mockClearSession = vi.fn();
const mockRefreshUser = vi.fn();
const mockToken = 'fake-token-for-test';

vi.mock('../authStore', () => ({
  useAuthStore: {
    // Mock the getState() method which is used by useUserStore
    getState: vi.fn(() => ({
      token: mockToken,
      setSession: mockSetSession,
      logout: mockLogout,
      clearSession: mockClearSession,
      refreshUser: mockRefreshUser,
    })),
  },
}));

// Mock global localStorage
const createMockLocalStorage = () => {
  let storage = {};
  return {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => (storage[key] = String(value)),
    removeItem: (key) => delete storage[key],
    clear: () => (storage = {}),
  };
};
vi.stubGlobal('localStorage', createMockLocalStorage());

// --- Test Suite ---
describe('User Store Unit Testing', () => {
  // 2. Reset store state and mock history before each test
  beforeEach(() => {
    // Reset Zustand store state to its initial values
    useUserStore.setState({ isLoadingUser: false, error: null });
    // Clear call history for all mocks
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();

    // Reset the authStore.getState mock's implementation for each test
    vi.mocked(useAuthStore.getState).mockReturnValue({
      token: mockToken,
      setSession: mockSetSession,
      logout: mockLogout,
      clearSession: mockClearSession,
      refreshUser: mockRefreshUser,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals(); // Clean up localStorage stub
    vi.restoreAllMocks();
  });

  // --- Test 1: Initial State & clearError ---
  it('should have correct initial state', () => {
    const state = useUserStore.getState();
    expect(state.isLoadingUser).toBe(false);
    expect(state.error).toBeNull();
  });

  it('clearError should set error state to null', () => {
    // Arrange: set an initial error
    useUserStore.setState({ error: 'An old error' });
    expect(useUserStore.getState().error).toBe('An old error');

    // Act
    useUserStore.getState().clearError();

    // Assert
    expect(useUserStore.getState().error).toBeNull();
  });

  // --- Test 2: getCurrentUser ---
  describe('getCurrentUser', () => {
    const mockUser = { id: 1, name: 'Test User' };
    const mockResponse = { status: 'success', data: { user: mockUser } };

    it('should set loading, call API, and call authStore.setSession on success', async () => {
      // Arrange
      getCurrentUserApi.mockResolvedValue(mockResponse);

      // Act
      const store = useUserStore.getState();
      const promise = store.getCurrentUser();

      // Assert: Check loading state immediately
      expect(useUserStore.getState().isLoadingUser).toBe(true);
      expect(useUserStore.getState().error).toBeNull();

      const result = await promise;

      // Assert: Check final state and mock calls
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(mockSetSession).toHaveBeenCalledTimes(1);
      expect(mockSetSession).toHaveBeenCalledWith(mockUser, mockToken);
      expect(result).toEqual(mockResponse);
    });

    it('should not call setSession if auth token is missing in authStore', async () => {
      // Arrange
      getCurrentUserApi.mockResolvedValue(mockResponse);
      // Override authStore mock for this test
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token: null,
        setSession: mockSetSession,
      });

      // Act
      await useUserStore.getState().getCurrentUser();

      // Assert
      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(mockSetSession).not.toHaveBeenCalled(); // No token, no session set
      expect(useUserStore.getState().isLoadingUser).toBe(false);
    });

    it('should set loading and set error on failure', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch user');
      getCurrentUserApi.mockRejectedValue(mockError);

      // Act
      const store = useUserStore.getState();
      await expect(store.getCurrentUser()).rejects.toThrow(mockError);

      // Assert
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(useUserStore.getState().error).toBe(mockError.message);
      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  // --- Test 3: refreshUser (the one in useUserStore) ---
  describe('refreshUser', () => {
    const mockUser = { id: 1, name: 'Refreshed User' };
    const mockSuccessResponse = { status: 'success', data: { user: mockUser } };

    it('should clear session if no token exists in store or localStorage', async () => {
      // Arrange
      localStorage.clear(); // localStorage is empty
      // Override authStore mock
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token: null, // No token in store
        clearSession: mockClearSession,
      });

      // Act
      await useUserStore.getState().refreshUser();

      // Assert
      expect(mockClearSession).toHaveBeenCalledTimes(1);
      expect(getCurrentUserApi).not.toHaveBeenCalled();
      expect(useUserStore.getState().isLoadingUser).toBe(false); // Fails fast
    });

    it('should set session on API success if token exists in localStorage', async () => {
      // Arrange
      localStorage.setItem('judiGuardToken', mockToken); // localStorage has token
      // Override authStore mock to have no token (testing localStorage fallback)
      vi.mocked(useAuthStore.getState).mockReturnValue({
        token: null,
        setSession: mockSetSession,
      });
      getCurrentUserApi.mockResolvedValue(mockSuccessResponse);

      // Act
      await useUserStore.getState().refreshUser();

      // Assert
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(mockSetSession).toHaveBeenCalledTimes(1);
      expect(mockSetSession).toHaveBeenCalledWith(mockUser, mockToken);
    });

    it('should clear session on API success but invalid data', async () => {
      // Arrange
      localStorage.setItem('judiGuardToken', mockToken);
      const mockFailResponse = { status: 'fail' }; // Invalid response
      getCurrentUserApi.mockResolvedValue(mockFailResponse);
      vi.mocked(useAuthStore.getState).mockReturnValue({
        ...useAuthStore.getState(), // Get default mocks
        clearSession: mockClearSession,
      });

      // Act
      await useUserStore.getState().refreshUser();

      // Assert
      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(mockClearSession).toHaveBeenCalledTimes(1); // Session cleared
      expect(useUserStore.getState().isLoadingUser).toBe(false);
    });

    it('should clear session on 401/403 auth error', async () => {
      // Arrange
      localStorage.setItem('judiGuardToken', mockToken);
      const mockError = { response: { status: 401 } };
      getCurrentUserApi.mockRejectedValue(mockError);
      vi.mocked(useAuthStore.getState).mockReturnValue({
        ...useAuthStore.getState(),
        clearSession: mockClearSession,
      });

      // Act
      await useUserStore.getState().refreshUser();

      // Assert
      expect(getCurrentUserApi).toHaveBeenCalledTimes(1);
      expect(mockClearSession).toHaveBeenCalledTimes(1); // Session cleared
      expect(useUserStore.getState().isLoadingUser).toBe(false);
    });
  });

  // --- Test 4: updateProfile ---
  describe('updateProfile', () => {
    it('should set loading, call API, and call authStore.setSession on success', async () => {
      // Arrange
      const profileData = { username: 'new-username' };
      const mockUser = { id: 1, username: 'new-username' };
      updateMyProfileApi.mockResolvedValue({
        status: 'success',
        data: { user: mockUser },
      });

      // Act
      await useUserStore.getState().updateProfile(profileData);

      // Assert
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(updateMyProfileApi).toHaveBeenCalledWith(profileData);
      expect(mockSetSession).toHaveBeenCalledWith(mockUser, mockToken);
    });

    it('should set loading and set error on failure', async () => {
      // Arrange
      const profileData = { username: 'new-username' };
      const mockError = new Error('Update Failed');
      updateMyProfileApi.mockRejectedValue(mockError);

      // Act
      await expect(useUserStore.getState().updateProfile(profileData)).rejects.toThrow(mockError);

      // Assert
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(useUserStore.getState().error).toBe(mockError.message);
      expect(mockSetSession).not.toHaveBeenCalled();
    });
  });

  // --- Test 5: deleteAccount ---
  describe('deleteAccount', () => {
    it('should set loading, call API, and call authStore.logout on success', async () => {
      // Arrange
      deleteMyAccountApi.mockResolvedValue({
        status: 'success',
        message: 'Deleted',
      });

      // Act
      await useUserStore.getState().deleteAccount();

      // Assert
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(deleteMyAccountApi).toHaveBeenCalledTimes(1);
      expect(mockLogout).toHaveBeenCalledTimes(1); // Check that logout was called
    });

    it('should set loading and set error on failure', async () => {
      // Arrange
      const mockError = new Error('Delete Failed');
      deleteMyAccountApi.mockRejectedValue(mockError);

      // Act
      await expect(useUserStore.getState().deleteAccount()).rejects.toThrow(mockError);

      // Assert
      expect(useUserStore.getState().isLoadingUser).toBe(false);
      expect(useUserStore.getState().error).toBe(mockError.message);
      expect(mockLogout).not.toHaveBeenCalled(); // Logout should not be called
    });
  });

  // --- Test 6: refreshUserData ---
  // describe("refreshUserData", () => {
  //   it("should call authStore.refreshUser", async () => {
  //     // Arrange
  //     mockRefreshUser.mockResolvedValueOnce({ id: 1, name: "Refreshed User" });

  //     // Act
  //     await useUserStore.getState().refreshUserData();

  //     // Assert
  //     expect(mockRefreshUser).toHaveBeenCalledTimes(1);
  //   });
  // });
});
