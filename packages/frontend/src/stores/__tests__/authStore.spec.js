import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuthStore } from "../authStore";
import {
  loginUserApi,
  registerUserApi,
  signInWithGoogleApi,
  verifyOtpApi,
  resendOtpApi,
} from "@/lib/services/authApi";

// --- 1. Mock External Dependencies ---

// Mock all imported API services
vi.mock("@/lib/services/authApi", () => ({
  loginUserApi: vi.fn(),
  registerUserApi: vi.fn(),
  signInWithGoogleApi: vi.fn(),
  verifyOtpApi: vi.fn(),
  resendOtpApi: vi.fn(),
}));

// --- Test Suite ---

describe("Auth Store Unit Testing", () => {
  const mockUser = { id: 1, username: "testuser", password: "somepassword" };
  const mockUserStored = { id: 1, username: "testuser" }; // User without password
  const mockToken = "fake-token-123";

  // Reset store state and mock history before each test
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      currentUser: null,
      isLoadingAuth: false,
      error: null,
    });
    vi.clearAllMocks();

    const mockStorage = {}; // Use a closure to hold the storage
    const mockLocalStorage = {
      getItem: (key) => mockStorage[key] || null,
      setItem: vi.fn((key, value) => {
        mockStorage[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
      }),
    };

    // 4. 🔥 Stub the global *inside* beforeEach
    vi.stubGlobal("localStorage", mockLocalStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // --- Test Helpers ---
  describe("Helpers (setSession, clearSession, setUser, isAuthenticated)", () => {
    it("setSession should update state, localStorage, and clean password", () => {
      useAuthStore.getState().setSession(mockUser, mockToken);
      const state = useAuthStore.getState();

      expect(state.currentUser).toEqual(mockUserStored);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "judiGuardUser",
        JSON.stringify(mockUserStored)
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "judiGuardToken",
        mockToken
      );
    });

    it("clearSession should clear state and localStorage", () => {
      useAuthStore.getState().setSession(mockUser, mockToken); // Atur dulu
      useAuthStore.getState().clearSession(); // Hapus
      const state = useAuthStore.getState();

      expect(state.currentUser).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      // Spy sekarang akan mendeteksi panggilan
      expect(localStorage.removeItem).toHaveBeenCalledWith("judiGuardToken");
      expect(localStorage.removeItem).toHaveBeenCalledWith("judiGuardUser");
    });

    it("setUser should update currentUser", () => {
      const newUser = { id: 2, username: "new", password: "bad" };

      useAuthStore.getState().setUser(newUser);
      const state = useAuthStore.getState();

      expect(state.currentUser).toEqual(newUser);
    });
  });

  // --- Test register action ---
  describe("register", () => {
    const userData = {
      userName: "new",
      email: "new@example.com",
      password: "123",
    };

    it("should set loading, call register API, and return data on success", async () => {
      const mockResponse = { data: { message: "Success" } };
      registerUserApi.mockResolvedValue(mockResponse.data);
      const store = useAuthStore.getState();

      const promise = store.register(userData);
      expect(useAuthStore.getState().isLoadingAuth).toBe(true);

      const result = await promise;

      expect(result).toEqual(mockResponse.data);
      expect(useAuthStore.getState().isLoadingAuth).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
      expect(registerUserApi).toHaveBeenCalledWith(userData);
      expect(useAuthStore.getState().currentUser).toBeNull(); // No session set
    });

    it("should set error and stop loading on failure", async () => {
      const mockError = new Error("Email exists");
      registerUserApi.mockRejectedValue(mockError);
      const store = useAuthStore.getState();

      await expect(store.register(userData)).rejects.toThrow(mockError);

      expect(useAuthStore.getState().isLoadingAuth).toBe(false);
      expect(useAuthStore.getState().error).toBe(mockError.message);
    });
  });

  // --- Test login action ---
  describe("login", () => {
    const credentials = { email: "test@example.com", password: "123" };
    const mockResponse = { data: { user: mockUser, token: mockToken } };

    it("should set loading, call login API, and set session on success", async () => {
      loginUserApi.mockResolvedValue(mockResponse); // API returns full response
      const store = useAuthStore.getState();

      const promise = store.login(credentials);
      expect(useAuthStore.getState().isLoadingAuth).toBe(true);

      await promise;

      const state = useAuthStore.getState();
      expect(state.isLoadingAuth).toBe(false);
      expect(state.currentUser).toEqual(mockUserStored); // Cleaned
      expect(state.token).toBe(mockToken);
      expect(loginUserApi).toHaveBeenCalledWith(credentials);
    });

    it("should set error and stop loading on failure", async () => {
      const mockError = new Error("Invalid credentials");
      loginUserApi.mockRejectedValue(mockError);
      const store = useAuthStore.getState();

      await expect(store.login(credentials)).rejects.toThrow(mockError);

      const state = useAuthStore.getState();
      expect(state.isLoadingAuth).toBe(false);
      expect(state.currentUser).toBeNull();
      expect(state.error).toBe(mockError.message);
    });
  });

  // --- Test signInWithGoogle action ---
  describe("signInWithGoogle", () => {
    const idToken = "google-id-token";
    const mockResponse = { user: mockUser, token: mockToken };

    it("should set loading, call API, and set session on success", async () => {
      signInWithGoogleApi.mockResolvedValue(mockResponse); // API returns data directly
      const store = useAuthStore.getState();

      const promise = store.signInWithGoogle(idToken);
      expect(useAuthStore.getState().isLoadingAuth).toBe(true);

      await promise;

      const state = useAuthStore.getState();
      expect(state.isLoadingAuth).toBe(false);
      expect(state.currentUser).toEqual(mockUserStored); // Cleaned
      expect(state.token).toBe(mockToken);
      expect(signInWithGoogleApi).toHaveBeenCalledWith(idToken);
    });

    it("should set error and stop loading on failure", async () => {
      const mockError = new Error("Google Sign-In Failed");
      signInWithGoogleApi.mockRejectedValue(mockError);
      const store = useAuthStore.getState();

      await expect(store.signInWithGoogle(idToken)).rejects.toThrow(mockError);

      const state = useAuthStore.getState();
      expect(state.isLoadingAuth).toBe(false);
      expect(state.error).toBe(mockError.message);
      expect(state.currentUser).toBeNull();
    });
  });

  // --- Test logout action ---
  describe("logout", () => {
    it("should call clearSession", () => {
      // Arrange
      useAuthStore.getState().setSession(mockUser, mockToken);
      expect(useAuthStore.getState().currentUser).toEqual(mockUserStored);

      // Act
      useAuthStore.getState().logout();

      // Assert
      const state = useAuthStore.getState();
      expect(state.currentUser).toBeNull();
      expect(state.token).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
    });
  });

  // --- Test verifyOtp action ---
  describe("verifyOtp", () => {
    const email = "test@example.com";
    const otp = "123456";
    const mockResponse = { data: { message: "Success" } };

    it("should set loading, call API, return data, and not set session", async () => {
      verifyOtpApi.mockResolvedValue(mockResponse.data);
      const store = useAuthStore.getState();

      const promise = store.verifyOtp(email, otp);
      expect(useAuthStore.getState().isLoadingAuth).toBe(true);

      const result = await promise;

      expect(result).toEqual(mockResponse.data);
      expect(useAuthStore.getState().isLoadingAuth).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
      expect(verifyOtpApi).toHaveBeenCalledWith(email, otp);
      expect(useAuthStore.getState().currentUser).toBeNull(); // No session set
    });

    it("should set error and stop loading on failure", async () => {
      const mockError = new Error("Invalid OTP");
      verifyOtpApi.mockRejectedValue(mockError);
      const store = useAuthStore.getState();

      await expect(store.verifyOtp(email, otp)).rejects.toThrow(mockError);

      const state = useAuthStore.getState();
      expect(state.isLoadingAuth).toBe(false);
      expect(state.error).toBe(mockError.message);
    });
  });

  // --- Test resendOtp action ---
  describe("resendOtp", () => {
    const email = "test@example.com";
    const mockResponse = { data: { message: "Resent" } };

    it("should set loading, call API, return data, and not set session", async () => {
      resendOtpApi.mockResolvedValue(mockResponse.data);
      const store = useAuthStore.getState();

      const promise = store.resendOtp(email);
      expect(useAuthStore.getState().isLoadingAuth).toBe(true);

      const result = await promise;

      expect(result).toEqual(mockResponse.data);
      expect(useAuthStore.getState().isLoadingAuth).toBe(false);
      expect(useAuthStore.getState().error).toBeNull();
      expect(resendOtpApi).toHaveBeenCalledWith(email);
      expect(useAuthStore.getState().currentUser).toBeNull(); // No session set
    });

    it("should set error and stop loading on failure", async () => {
      const mockError = new Error("Limit exceeded");
      resendOtpApi.mockRejectedValue(mockError);
      const store = useAuthStore.getState();

      await expect(store.resendOtp(email)).rejects.toThrow(mockError);

      const state = useAuthStore.getState();
      expect(state.isLoadingAuth).toBe(false);
      expect(state.error).toBe(mockError.message);
    });
  });
});
