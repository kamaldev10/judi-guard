import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProfilePresenter } from '../useProfilePresenter'; // <-- Adjust path
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useYoutubeStore } from '@/stores/youtubeStore';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

// --- 1. Mock Dependencies ---

// Mock stores
const mockGetCurrentUser = vi.fn();
const mockDeleteAccount = vi.fn();
vi.mock('@/stores/userStore', () => ({
  useUserStore: (selector) => {
    const state = {
      getCurrentUser: mockGetCurrentUser,
      isLoadingUser: false,
      error: null,
      deleteAccount: mockDeleteAccount,
    };

    if (typeof selector === 'function') {
      return selector(state);
    }

    return state;
  },
}));

const mockConnectYoutube = vi.fn();
const mockDisconnectYoutube = vi.fn();
vi.mock('@/stores/youtubeStore', () => ({
  useYoutubeStore: () => ({
    disconnectYoutube: mockDisconnectYoutube,
    connectYoutube: mockConnectYoutube,
  }),
}));

let mockCurrentUser = null;
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector) => {
    // This mock handles the selector: (state) => state.currentUser
    return selector({ currentUser: mockCurrentUser });
  },
}));

// Mock router
const mockNavigate = vi.fn();
let mockLocation = { pathname: '/profile', search: '' };
vi.mock('react-router-dom', () => ({
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(() => 'mock-toast-id-123'), // Mock loading
    update: vi.fn(), // Mock update
  },
}));

// Mock Swal
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
    showLoading: vi.fn(),
    close: vi.fn(),
  },
}));
/** @type {import('vitest').Mock} */
const mockedSwalFire = Swal.fire;

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  // Mock window.location.href
  delete window.location;
  window.location = { ...originalLocation, href: '' };
});
afterEach(() => {
  // Restore
  window.location = originalLocation;
});

// --- Test Suite ---
describe('useProfilePresenter (Hook Test)', () => {
  const mockUserWithYT = {
    _id: 'user123',
    email: 'test@user.com',
    youtubeChannelId: 'UC-123',
    youtubeChannelName: 'Test Channel',
    youtubeChannelThumbnail: 'http://img.png',
  };
  const mockUserNoYT = { _id: 'user456', email: 'no@yt.com' };

  // Helper to render the hook
  const renderHookPresenter = () => renderHook(() => useProfilePresenter());

  beforeEach(() => {
    vi.useFakeTimers(); // Use fake timers for setTimeout/setInterval
    vi.clearAllMocks();
    mockCurrentUser = mockUserWithYT; // Default to a logged-in, connected user
    mockLocation = { pathname: '/profile', search: '' }; // Default location
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Test 1: Initial State & Derived State ---
  it('should return correct initial state and derived state when connected', () => {
    // Arrange (Done in beforeEach)

    // Act
    const { result } = renderHookPresenter();

    // Assert
    expect(result.current.user).toEqual(mockUserWithYT);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.isYoutubeConnected).toBe(true);
    expect(result.current.youtubeChannelInfo).toEqual({
      name: 'Test Channel',
      thumbnailUrl: 'http://img.png',
    });
  });

  it('should return correct derived state when not connected', () => {
    // Arrange
    mockCurrentUser = mockUserNoYT; // Set user to be not connected

    // Act
    const { result } = renderHookPresenter();

    // Assert
    expect(result.current.isYoutubeConnected).toBe(false);
    expect(result.current.youtubeChannelInfo).toBeNull();
  });

  // --- Test 2: useEffect (OAuth Callback Success) ---
  it('should handle YouTube OAuth success callback from URL', async () => {
    // Arrange
    mockLocation = {
      pathname: '/profile',
      search: '?youtube_linked=true&message=OK',
    };
    mockGetCurrentUser.mockResolvedValue(undefined); // Mock the refresh call

    // Act
    const { result } = renderHookPresenter();

    // Act: Wait for useEffect async logic
    await act(async () => {
      await Promise.resolve();
    });

    // Assert
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1); // Check user was refreshed
    expect(result.current.youtubeStatusMessage).toBe('OK');
    expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
    expect(toast.error).not.toHaveBeenCalled();
  });

  // --- Test 3: useEffect (OAuth Callback Failure) ---
  // it("should handle YouTube OAuth failure callback from URL", async () => {
  //   // Arrange
  //   const errorMsg = "Token invalid";
  //   const encodedErrorMsg = encodeURIComponent(errorMsg);
  //   mockLocation = {
  //     pathname: "/profile",
  //     search: `?youtube_linked=false&error=${encodedErrorMsg}`,
  //   };
  //   mockGetCurrentUser.mockResolvedValue(undefined); // Refresh still runs

  //   // Act
  //   const { result } = renderHookPresenter();

  //   // Act: Wait for useEffect
  //   await act(async () => {
  //     await Promise.resolve();
  //   });

  //   // Assert
  //   expect(mockGetCurrentUser).toHaveBeenCalledTimes(1); // Refresh was called
  //   expect(result.current.youtubeStatusMessage).toBe(`Gagal: ${errorMsg}`);
  //   expect(toast.error).toHaveBeenCalledWith(errorMsg);
  //   expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
  // });

  // --- Test 4: useEffect (Status Message Timer) ---
  it('should clear the youtubeStatusMessage after 4 seconds', async () => {
    // Arrange
    mockLocation = {
      pathname: '/profile',
      search: '?youtube_linked=true&message=Berhasil!',
    };
    const { result } = renderHookPresenter();

    // Wait for useEffect
    await act(async () => {
      await Promise.resolve();
    });

    // Assert: Message is set
    expect(result.current.youtubeStatusMessage).toBe('Berhasil!');

    // Act: Advance timer by 4000ms
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Assert: Message is cleared
    expect(result.current.youtubeStatusMessage).toBe('');
  });

  // --- Test 5: handleEditProfile ---
  it('handleEditProfile should call navigate to /profile/edit', () => {
    const { result } = renderHookPresenter();

    act(() => {
      result.current.handleEditProfile();
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
  });

  // --- Test 6: handleConnectYouTubeAccount (Success) ---
  it('handleConnectYouTubeAccount should set loading, call connectYoutube, and redirect', async () => {
    const redirectUrl = 'https://google.com/auth';
    // Arrange
    mockConnectYoutube.mockResolvedValue({
      data: { redirectUrl: redirectUrl },
    });
    const { result } = renderHookPresenter();

    // Act
    let promise;
    act(() => {
      promise = result.current.handleConnectYouTubeAccount();
    });

    // Assert: Loading state
    expect(result.current.isConnectingYouTube).toBe(true);
    expect(result.current.youtubeStatusMessage).toContain('Mengarahkan');

    await act(async () => {
      await promise;
    });

    // Assert: API called and redirection
    expect(mockConnectYoutube).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe(redirectUrl);
  });

  // --- Test 7: handleDisconnectYouTubeAccount (Success) ---
  it('handleDisconnectYouTubeAccount should show confirm, call disconnect, and show toast', async () => {
    // Arrange
    mockedSwalFire.mockResolvedValue({ isConfirmed: true });
    mockDisconnectYoutube.mockResolvedValue({ message: 'Disconnected' });
    const { result } = renderHookPresenter();

    // Act
    await act(async () => {
      await result.current.handleDisconnectYouTubeAccount();
    });

    // Assert
    expect(mockedSwalFire).toHaveBeenCalledTimes(1);
    expect(toast.loading).toHaveBeenCalledWith('Memutuskan Koneksi...');
    expect(mockDisconnectYoutube).toHaveBeenCalledTimes(1);
    expect(toast.update).toHaveBeenCalledWith(
      'mock-toast-id-123',
      expect.objectContaining({
        render: 'Akun YouTube berhasil diputuskan.',
        type: 'success',
      }),
    );
    expect(result.current.isDisconnectingYouTube).toBe(false);
    expect(result.current.youtubeStatusMessage).toContain('berhasil diputuskan');
  });

  // --- Test 8: executeDeleteAccount (Success) ---
  // it("executeDeleteAccount should show confirm, call delete, show toast, and navigate", async () => {
  //   // Arrange
  //   mockedSwalFire.mockResolvedValue({ isConfirmed: true });
  //   mockDeleteAccount.mockResolvedValue({ message: "Success" });
  //   const { result } = renderHookPresenter();

  //   // Act
  //   await act(async () => {
  //     await result.current.executeDeleteAccount();
  //   });

  //   // Assert
  //   expect(mockedSwalFire).toHaveBeenCalledTimes(1);
  //   expect(toast.loading).toHaveBeenCalledWith("Menghapus Akun...");
  //   expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
  //   expect(toast.update).toHaveBeenCalledWith(
  //     "mock-toast-id-123",
  //     expect.objectContaining({
  //       render: "Akun Anda telah berhasil dihapus.",
  //       type: "success",
  //     })
  //   );
  //   expect(mockNavigate).toHaveBeenCalledWith("/");
  //   expect(result.current.isDeleting).toBe(false);
  // });

  // --- Test 9: executeDeleteAccount (Cancel) ---
  it('executeDeleteAccount should do nothing if Swal is cancelled', async () => {
    // Arrange
    mockedSwalFire.mockResolvedValue({ isConfirmed: false });
    const { result } = renderHookPresenter();

    // Act
    await act(async () => {
      await result.current.executeDeleteAccount();
    });

    // Assert
    expect(mockedSwalFire).toHaveBeenCalledTimes(1);
    expect(mockDeleteAccount).not.toHaveBeenCalled();
    expect(toast.loading).not.toHaveBeenCalled();
    expect(result.current.isDeleting).toBe(false);
  });
});
