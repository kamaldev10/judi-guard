import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as youtubeApi from '@/lib/services/youtubeApi';
import { useUserStore } from '../userStore';
import { useYoutubeStore } from '../youtubeStore';

// 1. Mock dependencies API
vi.mock('@/lib/services/youtubeApi', () => ({
  initiateYoutubeOAuthRedirectApi: vi.fn(),
  disconnectYoutubeAccountApi: vi.fn(),
}));

// 2. Mock UserStore (Cross-store interaction)
// Kita perlu memock getState() agar bisa mendeteksi panggilan ke refreshUser()
vi.mock('@/stores/userStore', () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

describe('useYoutubeStore', () => {
  // Helper: Reset state store sebelum setiap test
  const initialState = useYoutubeStore.getState();

  beforeEach(() => {
    vi.clearAllMocks();
    useYoutubeStore.setState(initialState, true);
  });

  // --- Test Initial State ---
  it('should have correct initial state', () => {
    const state = useYoutubeStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // --- Test Action: connectYoutube ---

  it('should handle connectYoutube success', async () => {
    const mockResponse = { authorizationUrl: 'https://google.com/auth' };
    // Setup Mock API
    vi.mocked(youtubeApi.initiateYoutubeOAuthRedirectApi).mockResolvedValue(mockResponse);

    // Jalankan action
    const result = await useYoutubeStore.getState().connectYoutube();

    const state = useYoutubeStore.getState();

    // Verifikasi
    expect(result).toEqual(mockResponse); // Return data benar
    expect(state.isLoading).toBe(false); // Loading kembali false
    expect(state.error).toBeNull(); // Tidak ada error
    expect(youtubeApi.initiateYoutubeOAuthRedirectApi).toHaveBeenCalledTimes(1);
  });

  it('should handle connectYoutube failure', async () => {
    const errorMessage = 'OAuth Failed';
    vi.mocked(youtubeApi.initiateYoutubeOAuthRedirectApi).mockRejectedValue(
      new Error(errorMessage),
    );

    // Expect throw error
    try {
      await useYoutubeStore.getState().connectYoutube();
    } catch (e) {
      expect(e.message).toBe(errorMessage);
    }

    const state = useYoutubeStore.getState();
    expect(state.isLoading).toBe(false); // Loading harus mati walau error (finally)
    expect(state.error).toBe(errorMessage); // Error tersimpan di state
  });

  // --- Test Action: disconnectYoutube (Complex Interaction) ---

  it('should handle disconnectYoutube success AND refresh user data', async () => {
    const mockResponse = { message: 'Disconnected' };
    const mockRefreshUser = vi.fn().mockResolvedValue(true);

    // 1. Mock API Disconnect
    vi.mocked(youtubeApi.disconnectYoutubeAccountApi).mockResolvedValue(mockResponse);

    // 2. Mock useUserStore.getState().refreshUser()
    // Kita simulasikan bahwa getState mengembalikan objek yg punya fungsi refreshUser
    vi.mocked(useUserStore.getState).mockReturnValue({
      refreshUser: mockRefreshUser,
    });

    // Jalankan Action
    const result = await useYoutubeStore.getState().disconnectYoutube();

    const state = useYoutubeStore.getState();

    // Verifikasi API Disconnect dipanggil
    expect(youtubeApi.disconnectYoutubeAccountApi).toHaveBeenCalledTimes(1);

    // 🔥 Verifikasi KUNCI: Pastikan user store di-refresh
    expect(useUserStore.getState).toHaveBeenCalled();
    expect(mockRefreshUser).toHaveBeenCalledTimes(1);

    // Verifikasi state dan return
    expect(result).toEqual(mockResponse);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle disconnectYoutube failure', async () => {
    const errorMessage = 'Disconnect Failed';
    const mockRefreshUser = vi.fn();

    // Mock API Gagal
    vi.mocked(youtubeApi.disconnectYoutubeAccountApi).mockRejectedValue(new Error(errorMessage));

    // Mock user store (untuk memastikan TIDAK dipanggil jika API gagal)
    vi.mocked(useUserStore.getState).mockReturnValue({
      refreshUser: mockRefreshUser,
    });

    try {
      await useYoutubeStore.getState().disconnectYoutube();
    } catch (e) {
      expect(e.message).toBe(errorMessage);
    }

    const state = useYoutubeStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe(errorMessage);

    // Pastikan refreshUser TIDAK dipanggil karena error terjadi sebelum baris tersebut
    expect(mockRefreshUser).not.toHaveBeenCalled();
  });
});
