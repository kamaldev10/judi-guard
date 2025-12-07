import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useManagePasswordStore } from "../managePasswordStore";
import {
  resetPasswordApi,
  changePasswordApi,
  forgotPasswordApi,
} from "@/lib/services/managePasswordApi";
import { useAuthStore } from "../authStore";

// --- 1. Mock External Dependencies ---

// Mock all imported API services
vi.mock("@/lib/services/managePasswordApi", () => ({
  resetPasswordApi: vi.fn(),
  changePasswordApi: vi.fn(),
  forgotPasswordApi: vi.fn(),
}));

// Mock the authStore
vi.mock("../authStore", () => ({
  useAuthStore: {
    // Mock only the getState() method
    getState: vi.fn(),
  },
}));

// --- Test Suite ---
describe("Manage Password Store Unit Testing", () => {
  // 2. Reset store state and mock history before each test
  beforeEach(() => {
    // Reset Zustand store state to its initial values
    useManagePasswordStore.setState({
      isLoading: false,
      error: null,
    });
    // Clear call history for all mocks
    vi.clearAllMocks();

    // Set a default return value for the mocked authStore.getState()
    // This is needed for the changePassword action
    vi.mocked(useAuthStore.getState).mockReturnValue({
      currentUser: { id: "user-123", username: "test" },
      // Add other authStore state if needed
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test 1: Initial State ---
  it("should have correct initial state", () => {
    const state = useManagePasswordStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // --- Test 2: forgotPassword action ---
  describe("forgotPassword", () => {
    it("should set loading, call API, and stop loading on success", async () => {
      // Arrange
      const email = "test@example.com";
      const mockResponse = { message: "Email sent" };
      forgotPasswordApi.mockResolvedValue(mockResponse);
      const store = useManagePasswordStore.getState();

      // Act
      const promise = store.forgotPassword(email);

      // Assert: Check loading state immediately
      expect(useManagePasswordStore.getState().isLoading).toBe(true);
      expect(useManagePasswordStore.getState().error).toBeNull();

      // Wait for the action to complete
      const result = await promise;

      // Assert: Check final state
      expect(useManagePasswordStore.getState().isLoading).toBe(false);
      expect(useManagePasswordStore.getState().error).toBeNull();
      expect(result).toEqual(mockResponse);

      // Verify API call
      expect(forgotPasswordApi).toHaveBeenCalledTimes(1);
      expect(forgotPasswordApi).toHaveBeenCalledWith(email);
    });

    it("should set loading, set error, and stop loading on failure", async () => {
      // Arrange
      const email = "test@example.com";
      const mockError = new Error("Not found");
      forgotPasswordApi.mockRejectedValue(mockError);
      const store = useManagePasswordStore.getState();

      // Act
      await expect(store.forgotPassword(email)).rejects.toThrow(mockError);

      // Assert: Check final state
      const state = useManagePasswordStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(mockError.message);
    });
  });

  // --- Test 3: resetPassword action ---
  describe("resetPassword", () => {
    const token = "reset-token";
    const pw = "newPassword123";

    it("should set loading, call API, and stop loading on success", async () => {
      // Arrange
      const mockResponse = { message: "Password reset" };
      resetPasswordApi.mockResolvedValue(mockResponse);
      const store = useManagePasswordStore.getState();

      // Act
      const result = await store.resetPassword(token, pw, pw);

      // Assert
      expect(useManagePasswordStore.getState().isLoading).toBe(false);
      expect(result).toEqual(mockResponse);
      expect(resetPasswordApi).toHaveBeenCalledTimes(1);
      expect(resetPasswordApi).toHaveBeenCalledWith(token, pw, pw);
    });

    it("should set error and stop loading on failure", async () => {
      // Arrange
      const mockError = new Error("Token expired");
      resetPasswordApi.mockRejectedValue(mockError);
      const store = useManagePasswordStore.getState();

      // Act
      await expect(store.resetPassword(token, pw, pw)).rejects.toThrow(
        mockError
      );

      // Assert
      expect(useManagePasswordStore.getState().isLoading).toBe(false);
      expect(useManagePasswordStore.getState().error).toBe(mockError.message);
    });
  });

  // --- Test 4: changePassword action ---
  describe("changePassword", () => {
    const pwOld = "oldPass";
    const pwNew = "newPass123";

    it("should set loading, call API (with user), and stop loading on success", async () => {
      // Arrange
      const mockResponse = { message: "Password changed" };
      changePasswordApi.mockResolvedValue(mockResponse);
      const store = useManagePasswordStore.getState();

      // Act
      const result = await store.changePassword(pwOld, pwNew, pwNew);

      // Assert
      expect(useManagePasswordStore.getState().isLoading).toBe(false);
      expect(result).toEqual(mockResponse);
      expect(useAuthStore.getState).toHaveBeenCalledTimes(1); // Check it got the user
      expect(changePasswordApi).toHaveBeenCalledTimes(1);
      expect(changePasswordApi).toHaveBeenCalledWith(pwOld, pwNew, pwNew);
    });

    it("should set error and stop loading if API fails", async () => {
      // Arrange
      const mockError = new Error("Wrong old password");
      changePasswordApi.mockRejectedValue(mockError);
      const store = useManagePasswordStore.getState();

      // Act
      await expect(store.changePassword(pwOld, pwNew, pwNew)).rejects.toThrow(
        mockError
      );

      // Assert
      expect(useManagePasswordStore.getState().isLoading).toBe(false);
      expect(useManagePasswordStore.getState().error).toBe(mockError.message);
    });

    it("should throw error and stop loading if currentUser is not found", async () => {
      // Arrange
      const expectedErrorMsg = "Pengguna tidak ditemukan.";
      // Override the default mock for this specific test
      vi.mocked(useAuthStore.getState).mockReturnValue({
        currentUser: null, // Simulate no user
      });
      const store = useManagePasswordStore.getState();

      // Act
      await expect(store.changePassword(pwOld, pwNew, pwNew)).rejects.toThrow(
        expectedErrorMsg
      );

      // Assert
      expect(useManagePasswordStore.getState().isLoading).toBe(false);
      expect(useManagePasswordStore.getState().error).toBe(expectedErrorMsg);
      // API should not have been called
      expect(changePasswordApi).not.toHaveBeenCalled();
    });
  });
});
