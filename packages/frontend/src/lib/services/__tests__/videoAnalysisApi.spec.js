import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "../apiClient";
import {
  submitVideoForAnalysisApi,
  getVideoAnalysisApi,
  getAnalyzedCommentsApi,
  batchDeleteJudiCommentsApi,
  deleteSingleCommentApi,
  getStudioLinkApi,
} from "../videoAnalysisApi";

// 3. Mock modul apiClient
vi.mock("../apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// --- Test Suite ---

describe("Video Analysis API Service Unit Testing", () => {
  // Bersihkan semua mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: submitVideoForAnalysisApi
  describe("submitVideoForAnalysisApi", () => {
    it("should call apiClient.post with the correct URL and data", async () => {
      const videoUrl = "https://youtube.com/watch?v=123";
      const mockResponseData = { id: "analisis123", status: "PROCESSING" };
      // Simulasikan respons sukses dari apiClient
      apiClient.post.mockResolvedValue({ data: { data: mockResponseData } });

      const result = await submitVideoForAnalysisApi(videoUrl);

      // Verifikasi apiClient.post dipanggil
      expect(apiClient.post).toHaveBeenCalledTimes(1);
      expect(apiClient.post).toHaveBeenCalledWith("/analysis/videos", {
        videoUrl,
      });

      // Verifikasi hasilnya adalah data yang di-unwrap
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if apiClient.post fails", async () => {
      const mockError = new Error("Network Error");
      apiClient.post.mockRejectedValue(mockError);

      await expect(submitVideoForAnalysisApi("url")).rejects.toThrow(Error);
    });
  });

  // Tes 2: getVideoAnalysisApi
  describe("getVideoAnalysisApi", () => {
    it("should call apiClient.get with the correct URL", async () => {
      const analysisId = "analisis123";
      const mockResponseData = {
        id: "analisis123",
        status: "COMPLETED",
        comments: [],
      };
      apiClient.get.mockResolvedValue({ data: { data: mockResponseData } });

      const result = await getVideoAnalysisApi(analysisId);

      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/analysis/videos/${analysisId}`
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if apiClient.get fails", async () => {
      apiClient.get.mockRejectedValue(new Error("Not Found"));
      await expect(getVideoAnalysisApi("id-salah")).rejects.toThrow(Error);
    });
  });

  // Tes 3: getAnalyzedCommentsApi
  describe("getAnalyzedCommentsApi", () => {
    it("should call apiClient.get with the correct comments URL", async () => {
      const analysisId = "analisis123";
      const mockResponseData = [{ id: "c1", text: "..." }];
      apiClient.get.mockResolvedValue({ data: { data: mockResponseData } });

      const result = await getAnalyzedCommentsApi(analysisId);

      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/analysis/videos/${analysisId}/comments`
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if apiClient.get fails", async () => {
      apiClient.get.mockRejectedValue(new Error("Error"));
      await expect(getAnalyzedCommentsApi("id-salah")).rejects.toThrow(Error);
    });
  });

  // Tes 4: batchDeleteJudiCommentsApi
  describe("batchDeleteJudiCommentsApi", () => {
    it("should call apiClient.delete with the correct URL", async () => {
      const analysisId = "analisis123";
      const mockResponseData = { deletedCount: 5 };
      apiClient.delete.mockResolvedValue({ data: { data: mockResponseData } });

      const result = await batchDeleteJudiCommentsApi(analysisId);

      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/analysis/videos/${analysisId}/judi-comments`
      );
      expect(result).toEqual(mockResponseData);
    });
    it("should throw an error if apiClient.delete fails", async () => {
      apiClient.delete.mockRejectedValue(new Error("Error"));
      await expect(batchDeleteJudiCommentsApi("id-salah")).rejects.toThrow(
        Error
      );
    });
  });

  // Tes 5: deleteSingleCommentApi
  describe("deleteSingleCommentApi", () => {
    it("should call apiClient.delete with the correct comment URL", async () => {
      const commentId = "komentarABC";
      const mockResponseData = { success: true, message: "Komentar dihapus" };
      apiClient.delete.mockResolvedValue({ data: mockResponseData }); // Perhatikan: return response.data

      const result = await deleteSingleCommentApi(commentId);

      expect(apiClient.delete).toHaveBeenCalledTimes(1);
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/analysis/comments/${commentId}`
      );
      expect(result).toEqual(mockResponseData); // Bukan .data.data
    });

    it("should throw an error if apiClient.delete fails", async () => {
      apiClient.delete.mockRejectedValue(new Error("Error"));
      await expect(deleteSingleCommentApi("id-salah")).rejects.toThrow(Error);
    });
  });

  // Tes 6: getStudioLinkApi
  describe("getStudioLinkApi", () => {
    it("should call apiClient.get and return the URL", async () => {
      const analysisId = "analisis123";
      const mockUrl = "https://studio.youtube.com/link/123";
      const mockResponseData = { url: mockUrl };
      apiClient.get.mockResolvedValue({ data: { data: mockResponseData } });

      const result = await getStudioLinkApi(analysisId);

      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(apiClient.get).toHaveBeenCalledWith(
        `/studio/comments-link/${analysisId}`
      );
      expect(result).toBe(mockUrl); // Mengembalikan .data.data.url
    });

    it("should throw a custom error if the API fails", async () => {
      const mockError = new Error("Gagal");
      apiClient.get.mockRejectedValue(mockError);

      await expect(getStudioLinkApi("id-salah")).rejects.toThrow(
        "Gagal mendapatkan link YouTube Studio." // Error default
      );
    });

    it("should throw the error message from the API response if it exists", async () => {
      const errorMessage = "Token YouTube tidak valid";
      const mockError = { response: { data: { message: errorMessage } } };
      apiClient.get.mockRejectedValue(mockError);

      await expect(getStudioLinkApi("id-salah")).rejects.toThrow(
        errorMessage // Error dari respons
      );
    });
  });
});
