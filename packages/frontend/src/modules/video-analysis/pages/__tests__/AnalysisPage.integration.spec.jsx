import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalysisUiStore } from '../../stores/analysis-ui.store.js';
import AnalysisPage from '../AnalysisPage';
import {
  useMyVideos,
  useSearchVideoMutation,
  useVideoCommentsQuery,
  useStartAnalysisMutation,
  useAnalysisStatusQuery,
  useAnalysisResultsQuery,
  useExecuteActionMutation,
  useUndoActionMutation,
} from '../../hooks/useAnalysisQueries.js';

// --- MOCKS ---

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('../../hooks/useAnalysisQueries.js', () => ({
  useMyVideos: vi.fn(),
  useSearchVideoMutation: vi.fn(),
  useVideoCommentsQuery: vi.fn(),
  useStartAnalysisMutation: vi.fn(),
  useAnalysisStatusQuery: vi.fn(),
  useAnalysisResultsQuery: vi.fn(),
  useExecuteActionMutation: vi.fn(),
  useUndoActionMutation: vi.fn(),
}));

vi.mock('@/shared/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }) => (open ? <div>{children}</div> : null),
  AlertDialogContent: ({ children }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }) => <div>{children}</div>,
  AlertDialogCancel: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
  AlertDialogAction: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    promise: vi.fn(),
  },
}));

describe('AnalysisPage & Components Integration', () => {
  const user = userEvent.setup();

  const mockVideo = {
    id: 'vid-123',
    title: 'Test Video 1',
    thumbnail: 'http://example.com/thumb.jpg',
    statistics: {
      viewCount: '1000',
      commentCount: '50',
      likeCount: '100',
    },
    publishedAt: '2026-07-09T12:00:00Z',
  };

  const mockComments = [
    {
      _id: 'comment-1',
      youtubeVideoId: 'vid-123',
      youtubeCommentId: 'yt-comm-1',
      commentAuthorDisplayName: 'Spammer 1',
      commentAuthorProfileImageUrl: 'http://avatar.jpg',
      commentTextDisplay: 'Main judi yuk di situs judi-guard!',
      commentPublishedAt: '2026-07-09T12:00:00Z',
      classification: 'JUDI',
      riskLevel: 'HIGH',
      confidenceScore: 0.98,
      detectedKeywords: ['judi'],
      actionTaken: 'NONE',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAnalysisUiStore.getState().reset();

    // Default mock returns
    useMyVideos.mockReturnValue({
      myVideos: [mockVideo],
      isLoadingList: false,
      nextPageToken: null,
      fetchMyVideos: vi.fn(),
    });

    useSearchVideoMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(mockVideo),
      isPending: false,
    });

    useVideoCommentsQuery.mockReturnValue({
      data: {
        comments: [
          {
            topLevelComment: {
              id: 'yt-comm-1',
              text: 'Main judi yuk!',
              author: { name: 'User 1' },
            },
          },
        ],
      },
      isLoading: false,
    });

    useStartAnalysisMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ analysisId: 'anal-789' }),
      isPending: false,
    });

    useAnalysisStatusQuery.mockReturnValue({
      data: {
        status: 'COMPLETED',
        totalCommentsAnalyzed: 100,
        totalSpamDetected: 5,
        moderationStatus: 'CLEANED',
      },
      isLoading: false,
    });

    useAnalysisResultsQuery.mockReturnValue({
      data: {
        comments: mockComments,
        pagination: { totalItems: 1, currentPage: 1, totalPages: 1 },
      },
      isLoading: false,
    });

    useExecuteActionMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });

    useUndoActionMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ success: true }),
      isPending: false,
    });
  });

  it('should render selection step by default and render list of channel videos', () => {
    render(<AnalysisPage />);

    expect(screen.getByText('Pilih Video untuk Dianalisis')).toBeInTheDocument();
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    expect(screen.getByText('1.000')).toBeInTheDocument(); // View count formatted
  });

  it('should navigate to PREVIEW step when clicking on a video grid item', async () => {
    render(<AnalysisPage />);

    const gridItem = screen.getByText('Test Video 1');
    await user.click(gridItem);

    // Verify UI store transitioned to PREVIEW
    expect(useAnalysisUiStore.getState().step).toBe('PREVIEW');
    expect(useAnalysisUiStore.getState().selectedVideo).toEqual(mockVideo);

    expect(screen.getByText('Preview Komentar Terbaru')).toBeInTheDocument();
  });

  it('should trigger start analysis process when clicking "Mulai Analisis AI"', async () => {
    // Transition UI state to PREVIEW
    act(() => {
      useAnalysisUiStore.getState().setSelectedVideo(mockVideo);
      useAnalysisUiStore.getState().setStep('PREVIEW');
    });

    render(<AnalysisPage />);

    const startBtn = screen.getByRole('button', { name: /mulai analisis ai/i });
    await user.click(startBtn);

    expect(useAnalysisUiStore.getState().step).toBe('SCANNING');
    expect(useAnalysisUiStore.getState().activeAnalysisId).toBe('anal-789');
  });

  it('should render results step when scanning completes', async () => {
    // Transition to SCANNING with active analysis id
    act(() => {
      useAnalysisUiStore.getState().setSelectedVideo(mockVideo);
      useAnalysisUiStore.getState().setActiveAnalysisId('anal-789');
      useAnalysisUiStore.getState().setStep('SCANNING');
    });

    // Mock status query returning COMPLETED
    useAnalysisStatusQuery.mockReturnValue({
      data: {
        status: 'COMPLETED',
        totalCommentsAnalyzed: 100,
        totalSpamDetected: 5,
        moderationStatus: 'CLEANED',
      },
      isLoading: false,
    });

    render(<AnalysisPage />);

    // Scanning screen should transition to Results automatically via useEffect
    expect(useAnalysisUiStore.getState().step).toBe('RESULTS');
    expect(screen.getByText('Hasil Analisis Video')).toBeInTheDocument();
    expect(screen.getByText('Potensi Spam')).toBeInTheDocument();
    expect(screen.getByText('Spammer 1')).toBeInTheDocument();
  });
});
