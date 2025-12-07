import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "../apiClient"; // <-- Adjust path to apiClient
import {
  initiateYoutubeOAuthRedirectApi,
  disconnectYoutubeAccountApi,
} from "../youtubeApi";

// 3. Mock the apiClient module
vi.mock("../apiClient", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// --- Test Suite ---

describe("YouTube API Service Unit Testing", () => {
  // Bersihkan semua mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Tests for initiateYoutubeOAuthRedirectApi ---
  describe("initiateYoutubeOAuthRedirectApi", () => {
    it("should call apiClient.get with the correct endpoint and return data", async () => {
      // Arrange
      const mockResponse = { data: { authorizationUrl: "http://google.com" } };
      apiClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await initiateYoutubeOAuthRedirectApi();

      // Assert
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith("/auth/youtube/connect");
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the specific error message from the API response", async () => {
      // Arrange
      const specificMessage = "Already connected";
      // Simulate an Axios error structure
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      await expect(initiateYoutubeOAuthRedirectApi()).rejects.toThrow(
        specificMessage
      );
    });

    it("should throw the default error message if the API fails without a specific message", async () => {
      // Arrange
      const mockError = new Error("Network Error");
      apiClient.get.mockRejectedValue(mockError);

      // Act & Assert
      const defaultMessage =
        "Terjadi kesalahan saat meminta untuk koneksi Youtube.";
      await expect(initiateYoutubeOAuthRedirectApi()).rejects.toThrow(
        defaultMessage
      );
    });
  });

  // --- Tests for disconnectYoutubeAccountApi ---
  describe("disconnectYoutubeAccountApi", () => {
    it("should call apiClient.post with the correct endpoint and return data", async () => {
      // Arrange
      const mockResponse = { data: { message: "Successfully disconnected" } };
      apiClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await disconnectYoutubeAccountApi();

      // Assert
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/auth/youtube/disconnect");
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw the specific error message from the API response", async () => {
      // Arrange
      const specificMessage = "No account connected";
      const mockError = { response: { data: { message: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(disconnectYoutubeAccountApi()).rejects.toThrow(
        specificMessage
      );
    });

    it("should throw the default error message if the API fails without a specific message", async () => {
      // Arrange
      const mockError = new Error("Network Error");
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      const defaultMessage =
        "Gagal memutuskan koneksi akun YouTube. Silakan coba lagi.";
      await expect(disconnectYoutubeAccountApi()).rejects.toThrow(
        defaultMessage
      );
    });
  });
});
