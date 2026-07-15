import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import AppErrorBoundary from '../AppErrorBoundary';
import ErrorFallback from '../ErrorFallback';

// --- Mock Dependencies ---
vi.mock('../ErrorFallback', () => ({
  default: vi.fn(({ error, resetErrorBoundary }) => (
    <div data-testid="mock-fallback">
      <h1>Error: {error.message}</h1>
      <button onClick={resetErrorBoundary}>Reset</button>
    </div>
  )),
}));

const originalLocation = window.location;
const originalConsoleError = console.error;
const mockReload = vi.fn();
const mockConsoleError = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  console.error = mockConsoleError;
  delete window.location;
  window.location = { ...originalLocation, reload: mockReload };
});

afterAll(() => {
  window.location = originalLocation;
  console.error = originalConsoleError;
});

const GoodChild = () => <div>This is fine.</div>;

const ProblemChild = () => {
  throw new Error('This is a test error');
};

// --- Test Suite ---
describe('App Error Boundary Integration Testing', () => {
  const user = userEvent.setup();

  it('should render children correctly when there is no error', () => {
    render(
      <AppErrorBoundary>
        <GoodChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByText('This is fine.')).toBeInTheDocument();

    expect(screen.queryByTestId('mock-fallback')).not.toBeInTheDocument();
  });

  it('should render the ErrorFallback when a child throws an error', () => {
    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>,
    );

    expect(screen.getByTestId('mock-fallback')).toBeInTheDocument();

    expect(screen.getByText('Error: This is a test error')).toBeInTheDocument();

    expect(screen.queryByText('This is fine.')).not.toBeInTheDocument();
  });

  it('should call console.error via the onError prop when an error is caught', () => {
    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>,
    );

    expect(mockConsoleError).toHaveBeenCalledTimes(2); // react mungkin memanggil error 2 kali
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Unhandled error:',
      expect.any(Error), // The error object
      expect.any(Object), // The componentStack info
    );
  });

  it("should call window.location.reload when the fallback's reset function is triggered", async () => {
    render(
      <AppErrorBoundary>
        <ProblemChild />
      </AppErrorBoundary>,
    );

    const resetButton = screen.getByRole('button', { name: /reset/i });

    await user.click(resetButton);

    expect(mockReload).toHaveBeenCalledTimes(1);
  });
});
