import { describe, it, expect, vi, beforeEach } from "vitest";
import * as videoAnalysisApi from "@/lib/services/videoAnalysisApi";
import { useVideoAnalysisStore } from "../videoAnalysisStore";

// 1. Mock semua fungsi API agar tidak melakukan network request asli
vi.mock("@/lib/services/videoAnalysisApi", () => ({
  submitVideoForAnalysisApi: vi.fn(),
  getVideoAnalysisApi: vi.fn(),
  getAnalyzedCommentsApi: vi.fn(),
  batchDeleteJudiCommentsApi: vi.fn(),
  deleteSingleCommentApi: vi.fn(),
  getStudioLinkApi: vi.fn(),
}));

describe("useVideoAnalysisStore unit testing", () => {
  // Helper untuk reset state sebelum setiap test
  const initialState = useVideoAnalysisStore.getState();

  beforeEach(() => {
    vi.clearAllMocks(); // Bersihkan history panggilan mock
    useVideoAnalysisStore.setState(initialState, true); // Reset store ke awal
  });

  // --- Test Initial State & Reset ---

  it("should have correct initial state", () => {
    const state = useVideoAnalysisStore.getState();
    expect(state.isLoadingAnalysis).toBe(false);
    expect(state.error).toBeNull();
    expect(state.currentAnalysis).toBeNull();
    expect(state.analyzedComments).toEqual([]);
    expect(state.studioLink).toBeNull();
  });

  it("should reset state correctly using resetAnalysis", () => {
    // Set state "kotor" dulu
    useVideoAnalysisStore.setState({
      isLoadingAnalysis: true,
      error: "Error",
      currentAnalysis: { id: 1 },
      analyzedComments: [1, 2],
      studioLink: "http://link.com",
    });

    // Panggil reset
    useVideoAnalysisStore.getState().resetAnalysis();

    // Verifikasi kembali bersih
    const state = useVideoAnalysisStore.getState();
    expect(state.currentAnalysis).toBeNull();
    expect(state.analyzedComments).toEqual([]);
    expect(state.error).toBeNull();
  });

  // --- Test Actions: submitVideoForAnalysis ---

  it("should handle submitVideoForAnalysis success", async () => {
    const mockData = { analysisId: "123", status: "queued" };
    // Setup mock return value
    vi.mocked(videoAnalysisApi.submitVideoForAnalysisApi).mockResolvedValue(
      mockData
    );

    // Panggil action
    await useVideoAnalysisStore
      .getState()
      .submitVideoForAnalysis("http://youtube.com/video");

    const state = useVideoAnalysisStore.getState();

    // Cek loading mati
    expect(state.isLoadingAnalysis).toBe(false);
    // Cek data tersimpan
    expect(state.currentAnalysis).toEqual(mockData);
    // Cek API dipanggil dengan argumen benar
    expect(videoAnalysisApi.submitVideoForAnalysisApi).toHaveBeenCalledWith(
      "http://youtube.com/video"
    );
  });

  it("should handle submitVideoForAnalysis failure", async () => {
    const errorMessage = "Invalid URL";
    vi.mocked(videoAnalysisApi.submitVideoForAnalysisApi).mockRejectedValue(
      new Error(errorMessage)
    );

    // Gunakan try-catch karena action melempar error kembali (throw err)
    try {
      await useVideoAnalysisStore.getState().submitVideoForAnalysis("bad-url");
    } catch (e) {
      expect(e.message).toBe(errorMessage);
    }

    const state = useVideoAnalysisStore.getState();
    expect(state.isLoadingAnalysis).toBe(false);
    expect(state.error).toBe(errorMessage);
    expect(state.currentAnalysis).toBeNull();
  });

  // --- Test Actions: fetchVideoAnalysis ---

  it("should handle fetchVideoAnalysis success", async () => {
    const mockData = { analysisId: "123", status: "completed" };
    vi.mocked(videoAnalysisApi.getVideoAnalysisApi).mockResolvedValue(mockData);

    await useVideoAnalysisStore.getState().fetchVideoAnalysis("123");

    const state = useVideoAnalysisStore.getState();
    expect(state.currentAnalysis).toEqual(mockData);
    expect(state.isLoadingAnalysis).toBe(false);
  });

  // --- Test Actions: fetchAnalyzedComments ---

  it("should handle fetchAnalyzedComments success", async () => {
    const mockComments = [{ id: 1, text: "Judi" }];
    vi.mocked(videoAnalysisApi.getAnalyzedCommentsApi).mockResolvedValue(
      mockComments
    );

    await useVideoAnalysisStore.getState().fetchAnalyzedComments("123");

    const state = useVideoAnalysisStore.getState();
    expect(state.analyzedComments).toEqual(mockComments);
    expect(state.isLoadingAnalysis).toBe(false);
  });

  // --- Test Actions: batchDeleteJudiComments (Chaining Test) ---

  it("should call batchDelete AND then refresh comments on success", async () => {
    const analysisId = "123";
    const deleteResult = { deletedCount: 5 };
    const refreshedComments = [{ id: 2, text: "Clean Comment" }];

    // Mock Delete API
    vi.mocked(videoAnalysisApi.batchDeleteJudiCommentsApi).mockResolvedValue(
      deleteResult
    );
    // Mock Fetch API (karena dipanggil setelah delete sukses)
    vi.mocked(videoAnalysisApi.getAnalyzedCommentsApi).mockResolvedValue(
      refreshedComments
    );

    await useVideoAnalysisStore.getState().batchDeleteJudiComments(analysisId);

    const state = useVideoAnalysisStore.getState();

    // 1. Pastikan Delete API dipanggil
    expect(videoAnalysisApi.batchDeleteJudiCommentsApi).toHaveBeenCalledWith(
      analysisId
    );

    // 2. Pastikan Fetch API dipanggil SETELAH delete (untuk refresh UI)
    expect(videoAnalysisApi.getAnalyzedCommentsApi).toHaveBeenCalledWith(
      analysisId
    );

    // 3. Pastikan state comment terupdate
    expect(state.analyzedComments).toEqual(refreshedComments);
    expect(state.isLoadingAnalysis).toBe(false);
  });

  it("should set error if batchDelete fails", async () => {
    vi.mocked(videoAnalysisApi.batchDeleteJudiCommentsApi).mockRejectedValue(
      new Error("Delete failed")
    );

    try {
      await useVideoAnalysisStore.getState().batchDeleteJudiComments("123");
    } catch (e) {
      // expected
    }

    const state = useVideoAnalysisStore.getState();
    expect(state.error).toBe("Delete failed");
    expect(state.isLoadingAnalysis).toBe(false);
    // Fetch tidak boleh dipanggil jika delete gagal
    expect(videoAnalysisApi.getAnalyzedCommentsApi).not.toHaveBeenCalled();
  });

  // --- Test Actions: deleteSingleComment (Chaining Test) ---

  it("should call deleteSingle AND then refresh comments", async () => {
    const commentId = "c1";
    const analysisId = "a1";
    const refreshedComments = [];

    vi.mocked(videoAnalysisApi.deleteSingleCommentApi).mockResolvedValue({
      success: true,
    });
    vi.mocked(videoAnalysisApi.getAnalyzedCommentsApi).mockResolvedValue(
      refreshedComments
    );

    await useVideoAnalysisStore
      .getState()
      .deleteSingleComment(commentId, analysisId);

    expect(videoAnalysisApi.deleteSingleCommentApi).toHaveBeenCalledWith(
      commentId
    );
    expect(videoAnalysisApi.getAnalyzedCommentsApi).toHaveBeenCalledWith(
      analysisId
    );
    expect(useVideoAnalysisStore.getState().analyzedComments).toEqual(
      refreshedComments
    );
  });

  // --- Test Actions: fetchStudioLink ---

  it("should update studioLink on success", async () => {
    const mockUrl = "https://studio.youtube.com/xyz";
    vi.mocked(videoAnalysisApi.getStudioLinkApi).mockResolvedValue(mockUrl);

    await useVideoAnalysisStore.getState().fetchStudioLink("123");

    expect(useVideoAnalysisStore.getState().studioLink).toBe(mockUrl);
  });
});
