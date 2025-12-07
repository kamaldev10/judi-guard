import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "../apiClient";
import { predictTextApi } from "../predictTextApi";

// 3. Mock modul apiClient
vi.mock("../apiClient", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// --- Test Suite ---

describe("Text Analysis API Service Unit Testing", () => {
  // Bersihkan semua mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Tes untuk predictTextApi ---
  describe("predictTextApi", () => {
    const testText = "Ini adalah teks untuk dianalisis";

    it("should call apiClient.post with the correct endpoint and data, and return res.data", async () => {
      // Arrange
      const mockResponseData = { classification: "JUDI", confidence: 0.99 };
      // Simulate a successful API response (function returns res.data directly)
      apiClient.post.mockResolvedValue({ data: mockResponseData });

      // Act
      const result = await predictTextApi(testText);

      // Assert
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/text/predict", {
        text: testText,
      });
      expect(result).toEqual(mockResponseData);
    });

    it("should throw the default error message if the API fails without a specific message", async () => {
      // Arrange
      const mockError = new Error("Network Error");
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      const expectedErrorMessage = `Gagal memanggil server AI: ${mockError.message}`;
      await expect(predictTextApi(testText)).rejects.toThrow(
        expectedErrorMessage
      );
    });

    it("should throw the specific error message from 'error.response.data.message'", async () => {
      // Arrange
      const specificMessage = "Input diperlukan dan tidak boleh kosong.";
      // Simulate an Axios error structure
      const mockError = { res: { data: { message: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(predictTextApi(testText)).rejects.toThrow(specificMessage);
    });

    it("should throw the specific error message from 'error.response.data.error'", async () => {
      // Arrange
      const specificMessage = "Validation_Error";
      // Simulate an Axios error structure using the 'error' key
      const mockError = { res: { data: { error: specificMessage } } };
      apiClient.post.mockRejectedValue(mockError);

      // Act & Assert
      await expect(predictTextApi(testText)).rejects.toThrow(specificMessage);
    });
  });
});
