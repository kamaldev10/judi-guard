import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalysisFormSection from '../AnalysisFormSection';

// --- Mocking Dependencies ---

// 1. Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    section: React.forwardRef(({ children, ...props }, ref) => (
      <section ref={ref} {...props}>
        {children}
      </section>
    )),
  },
}));

// 2. Mock Komponen Anak
//    Kita hanya perlu placeholder sederhana dan menangkap props
// const MockAnalysisSubmitForm = vi.fn();
// const MockAnalysisResultHeader = vi.fn();
// const MockAnalysisSummary = vi.fn();
// const MockCommentList = vi.fn();

vi.mock('../AnalysisSubmitForm', () => ({
  default: vi.fn(({ onSubmit, setVideoUrl, videoUrl, isActionInProgress, loadingMessage }) => (
    <div data-testid="mock-submit-form">
      <input aria-label="mock-video-url" value={videoUrl} onChange={setVideoUrl} />
      <button onClick={onSubmit} disabled={isActionInProgress}>
        Submit Mock
      </button>
      {loadingMessage && <p>{loadingMessage}</p>}
    </div>
  )),
}));
vi.mock('../AnalysisResultHeader', () => ({
  default: vi.fn(({ analysisId, videoData }) => (
    <div data-testid="mock-result-header">
      Header for {analysisId} - Status: {videoData?.status}
    </div>
  )),
}));
vi.mock('../AnalysisSummary', () => ({
  default: vi.fn(({ onManageComments, isActionInProgress }) => (
    <div data-testid="mock-summary">
      <button onClick={onManageComments} disabled={isActionInProgress}>
        Manage Mock
      </button>
    </div>
  )),
}));
vi.mock('../CommentList', () => ({
  default: vi.fn(({ comments, isLoadingInitial, isActionInProgress }) => (
    <div data-testid="mock-comment-list">
      Comments: {comments.length}
      {isLoadingInitial && <span>Loading Comments...</span>}
    </div>
  )),
}));

import MockAnalysisSubmitForm from '../AnalysisSubmitForm';
import MockAnalysisResultHeader from '../AnalysisResultHeader';
import MockAnalysisSummary from '../AnalysisSummary';
import MockCommentList from '../CommentList';

// 3. 🔥 Mock Hook Kustom `useVideoAnalysis`
//    Ini adalah inti tes. Kita kontrol semua return value-nya.
const mockSetVideoUrl = vi.fn();
const mockHandleSubmitAnalysis = vi.fn();
const mockHandleManageComments = vi.fn();

// State awal hook yang bisa diubah dalam tes
let mockHookState = {
  videoUrl: '',
  isLoading: false,
  isAnalyzing: false,
  isDeleting: false,
  analysisId: null,
  videoAnalysisData: null,
  analyzedComments: [],
  pieChartData: [],
  stats: {},
  pollingMessage: null,
  // Kaitkan fungsi mock ke state hook
  setVideoUrl: mockSetVideoUrl,
  handleSubmitAnalysis: mockHandleSubmitAnalysis,
  handleManageComments: mockHandleManageComments,
};

vi.mock('@/hooks/video-analysis/useVideoAnalysis', () => ({
  useVideoAnalysis: () => mockHookState,
}));

// --- Test Suite ---

describe('Analysis Form Section Integration Testing', () => {
  const user = userEvent.setup();

  // Reset state hook dan mock functions sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset state hook ke default
    mockHookState = {
      videoUrl: '',
      isLoading: false,
      isAnalyzing: false,
      isDeleting: false,
      analysisId: null,
      videoAnalysisData: null,
      analyzedComments: [],
      pieChartData: [],
      stats: {},
      pollingMessage: null,
      setVideoUrl: mockSetVideoUrl,
      handleSubmitAnalysis: mockHandleSubmitAnalysis,
      handleManageComments: mockHandleManageComments,
    };
    // Reset mock komponen
    MockAnalysisSubmitForm.mockClear();
    MockAnalysisResultHeader.mockClear();
    MockAnalysisSummary.mockClear();
    MockCommentList.mockClear();
  });

  // Tes 1: Render Awal
  it('should render AnalysisSubmitForm initially and not the result section', () => {
    render(<AnalysisFormSection />);
    expect(screen.getByTestId('mock-submit-form')).toBeInTheDocument();

    // --- Langkah Diagnosis ---
    // 1. Pastikan mock dipanggil setidaknya sekali
    expect(MockAnalysisSubmitForm).toHaveBeenCalled();

    // 2. Cek jumlah argumen pada panggilan pertama
    console.log(
      'Jumlah argumen diterima MockAnalysisSubmitForm:',
      MockAnalysisSubmitForm.mock.calls[0].length,
    );
    expect(MockAnalysisSubmitForm.mock.calls[0].length).toBe(2); // Harusnya 2 (props, undefined)

    // 3. Cek nilai argumen kedua
    console.log(
      'Argumen kedua diterima MockAnalysisSubmitForm:',
      MockAnalysisSubmitForm.mock.calls[0][1],
    );
    expect(MockAnalysisSubmitForm.mock.calls[0][1]).toBeUndefined(); // Harusnya undefined

    // 4. Baru lakukan assertion asli DENGAN expect.anything()
    // expect(MockAnalysisSubmitForm).toHaveBeenCalledWith(
    //   expect.objectContaining({ videoUrl: "", isActionInProgress: false }),
    //   expect.anything()
    // );

    // 4a. Pastikan mock dipanggil 1 kali
    expect(MockAnalysisSubmitForm).toHaveBeenCalledTimes(1);

    // 4b. Ambil argumen dari panggilan pertama (indeks 0)
    const firstCallArgs = MockAnalysisSubmitForm.mock.calls[0];

    // 4c. Verifikasi jumlah argumen
    expect(firstCallArgs.length).toBe(2); // Pastikan ada 2 argumen

    // 4d. Verifikasi argumen pertama (props)
    const receivedProps = firstCallArgs[0];
    expect(receivedProps).toEqual(
      expect.objectContaining({ videoUrl: '', isActionInProgress: false }),
    );

    // 4e. (Opsional) Verifikasi argumen kedua
    expect(firstCallArgs[1]).toBeUndefined();
  });

  // Tes 2: Interaksi Input di SubmitForm
  // it("should call setVideoUrl from hook when input changes in SubmitForm", async () => {
  //   render(<AnalysisFormSection />);
  //   const mockInput = screen.getByLabelText("mock-video-url"); // Cari input di mock
  //   const testUrl = "https://test.com";

  //   // Simulasikan ketikan (ini akan memicu prop onChange di mock)
  //   await user.type(mockInput, testUrl);

  //   // Verifikasi setVideoUrl (dari hook) dipanggil
  //   expect(mockSetVideoUrl).toHaveBeenCalled();
  //   // Cek argumen event terakhir (jika perlu)
  //   expect(mockSetVideoUrl.mock.calls[testUrl.length - 1][0].target.value).toBe(
  //     testUrl
  //   );
  // });

  // Tes 3: Interaksi Submit di SubmitForm
  it('should call handleSubmitAnalysis from hook when submit is triggered from SubmitForm', async () => {
    render(<AnalysisFormSection />);
    // Cari tombol submit di mock
    const mockSubmitButton = screen.getByRole('button', {
      name: 'Submit Mock',
    });

    // Klik tombol
    await user.click(mockSubmitButton);

    // Verifikasi handleSubmitAnalysis (dari hook) dipanggil
    expect(mockHandleSubmitAnalysis).toHaveBeenCalledTimes(1);
  });

  // Tes 4: Render saat Loading/Analyzing
  it('should pass correct loading state and message to SubmitForm', () => {
    // Ubah state hook
    act(() => {
      mockHookState.isAnalyzing = true;
      mockHookState.pollingMessage = 'Checking video...';
      mockHookState.isLoading = true; // Contoh kombinasi loading
    });

    render(<AnalysisFormSection />);

    // Periksa panggilan mock TERAKHIR
    const lastCallArgs =
      MockAnalysisSubmitForm.mock.calls[MockAnalysisSubmitForm.mock.calls.length - 1];

    // Periksa props (argumen pertama, indeks 0)
    const expectedProps = expect.objectContaining({
      isActionInProgress: true,
      loadingMessage: 'Checking video...',
    });
    expect(lastCallArgs[0]).toEqual(expectedProps);

    expect(screen.getByText('Checking video...')).toBeInTheDocument();
  });

  // Tes 5: Render Result Section (Processing)
  // it("should render ResultHeader and CommentList when analysisId and videoData appear (processing)", () => {
  //   // Ubah state hook
  //   act(() => {
  //     mockHookState.analysisId = "123";
  //     mockHookState.videoAnalysisData = {
  //       status: "PROCESSING",
  //       videoTitle: "Test Vid",
  //     };
  //     mockHookState.pollingMessage = "Processing comments...";
  //   });

  //   render(<AnalysisFormSection />);

  //   // Cek ResultHeader ada dan menerima props
  //   expect(screen.getByTestId("mock-result-header")).toBeInTheDocument();
  //   expect(MockAnalysisResultHeader).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       analysisId: "123",
  //       videoData: mockHookState.videoAnalysisData,
  //       pollingMessage: mockHookState.pollingMessage,
  //     })
  //   );

  //   // Cek CommentList ada (meskipun mungkin loading)
  //   expect(screen.getByTestId("mock-comment-list")).toBeInTheDocument();
  //   expect(MockCommentList).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       comments: [], // Komentar masih kosong
  //       isLoadingInitial: true, // isLoading=false tapi comment=0 dan !isAnalyzing=false
  //       isActionInProgress: false,
  //     })
  //   );

  //   // Cek Summary TIDAK ada
  //   expect(screen.queryByTestId("mock-summary")).not.toBeInTheDocument();
  // });

  // // Tes 6: Render Result Section (Completed)
  // it("should render Header, Summary, and CommentList when analysis is COMPLETED", () => {
  //   const commentsData = [{ _id: "c1", classification: "JUDI" }];
  //   const statsData = { total: 1, JUDI: 1 };
  //   const pieData = [{ name: "JUDI", value: 1 }];
  //   // Ubah state hook
  //   act(() => {
  //     mockHookState.analysisId = "456";
  //     mockHookState.videoAnalysisData = {
  //       status: "COMPLETED",
  //       videoTitle: "Final Vid",
  //     };
  //     mockHookState.analyzedComments = commentsData;
  //     mockHookState.stats = statsData;
  //     mockHookState.pieChartData = pieData;
  //   });

  //   render(<AnalysisFormSection />);

  //   // Cek ResultHeader ada
  //   expect(screen.getByTestId("mock-result-header")).toBeInTheDocument();
  //   expect(MockAnalysisResultHeader).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       analysisId: "456",
  //       videoData: mockHookState.videoAnalysisData,
  //     })
  //   );

  //   // Cek Summary ADA dan menerima props
  //   expect(screen.getByTestId("mock-summary")).toBeInTheDocument();
  //   expect(MockAnalysisSummary).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       pieChartData: pieData,
  //       stats: statsData,
  //       isActionInProgress: false,
  //       // onManageComments harus diteruskan
  //       onManageComments: mockHandleManageComments,
  //     })
  //   );

  //   // Cek CommentList ADA dengan data
  //   expect(screen.getByTestId("mock-comment-list")).toBeInTheDocument();
  //   expect(MockCommentList).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       comments: commentsData,
  //       isLoadingInitial: false,
  //       isActionInProgress: false,
  //     })
  //   );
  // });

  // Tes 7: Interaksi Tombol Manage Comments
  it('should call handleManageComments from hook when triggered from Summary', async () => {
    // Setup state agar Summary render tombol
    act(() => {
      mockHookState.analysisId = '789';
      mockHookState.videoAnalysisData = { status: 'COMPLETED' };
      mockHookState.analyzedComments = [{ _id: 'c1', classification: 'JUDI' }];
      mockHookState.stats = { total: 1, JUDI: 1 };
    });

    render(<AnalysisFormSection />);

    // Cari tombol di dalam mock Summary
    const mockManageButton = screen.getByRole('button', {
      name: 'Manage Mock',
    });

    // Klik tombol
    await user.click(mockManageButton);

    // Verifikasi handleManageComments (dari hook) dipanggil
    expect(mockHandleManageComments).toHaveBeenCalledTimes(1);
  });

  // Tes 8: State Action In Progress (misal Deleting)
  // it("should pass isActionInProgress=true to children when deleting", () => {
  //   // Setup state agar semua komponen relevan render
  //   act(() => {
  //     mockHookState.analysisId = "abc";
  //     mockHookState.videoAnalysisData = { status: "COMPLETED" };
  //     mockHookState.analyzedComments = [{ _id: "c1", classification: "JUDI" }];
  //     mockHookState.stats = { total: 1, JUDI: 1 };
  //     mockHookState.isDeleting = true; // <-- State deleting aktif
  //   });

  //   render(<AnalysisFormSection />);

  //   // Verifikasi SubmitForm menerima isActionInProgress=true
  //   expect(MockAnalysisSubmitForm).toHaveBeenCalledWith(
  //     expect.objectContaining({ isActionInProgress: true })
  //   );
  //   // Verifikasi Summary menerima isActionInProgress=true
  //   expect(MockAnalysisSummary).toHaveBeenCalledWith(
  //     expect.objectContaining({ isActionInProgress: true })
  //   );
  //   // Verifikasi CommentList menerima isActionInProgress=true
  //   expect(MockCommentList).toHaveBeenCalledWith(
  //     expect.objectContaining({ isActionInProgress: true })
  //   );

  //   // (Opsional) Cek tombol di dalam mock disabled
  //   expect(screen.getByRole("button", { name: "Submit Mock" })).toBeDisabled();
  //   expect(screen.getByRole("button", { name: "Manage Mock" })).toBeDisabled();
  // });
});
