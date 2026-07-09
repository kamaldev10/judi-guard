import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider, Title } from 'react-head';
import AnalysisPage from '../AnalysisPage';

// Mock 'framer-motion'
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
  useScroll: vi.fn(() => ({ scrollYProgress: { get: () => 0 } })),
  useTransform: vi.fn(() => ({ value: 1 })),
}));

// Mock 'react-head' (Title component)
vi.mock('react-head', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      document.title = children;
      return null;
    },
  };
});

// Mock child components
vi.mock('@/components/work-guide/WorkGuideSection', () => ({
  default: vi.fn(() => <div data-testid="mock-work-guide">Work Guide Section</div>),
}));
vi.mock('@/components/analysis/AnalysisFormSection', () => ({
  default: vi.fn(() => <div data-testid="mock-analysis-form">Analysis Form Section</div>),
}));

// --- Test Suite ---
describe('Analysis Page Integration Testing', () => {
  const mockScrollIntoView = vi.fn();

  // Helper render
  const renderPage = (route = '/analysis') => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[route]}>
          <AnalysisPage />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  beforeEach(() => {
    vi.useFakeTimers(); // Use fake timers for setTimeout
    vi.clearAllMocks();
    document.title = '';
    window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
    delete window.HTMLElement.prototype.scrollIntoView;
  });

  // Test 1: Initial Render and Title
  it('should render the title and all child sections', () => {
    renderPage();

    expect(document.title).toBe('Analisis | Judi Guard');
    expect(screen.getByTestId('mock-work-guide')).toBeInTheDocument();
    expect(screen.getByTestId('mock-analysis-form')).toBeInTheDocument();
  });

  // Test 2: Default Scrolling (to work-guide)
  it("should scroll to the 'work-guide' section by default on load (no hash)", () => {
    renderPage('/analysis'); // Render without a hash

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Check if scrollIntoView was called (by the ref logic)
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  // Test 3: Hash Scrolling (to analysis-results)
  // it("should scroll to the 'analysis-results' section when hash is provided", () => {
  //   renderPage("/analysis#analysis-results"); // Render *with* a hash

  //   act(() => {
  //     vi.advanceTimersByTime(100);
  //   });

  //   expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  //   expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  // });

  // Test 4: No Scroll on Invalid Hash
  it('should not scroll if hash is present but element does not exist', () => {
    renderPage('/analysis#non-existent-id');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });
});
