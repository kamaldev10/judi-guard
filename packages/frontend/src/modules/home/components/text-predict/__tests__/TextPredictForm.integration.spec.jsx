import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextPredictForm from '../TextPredictForm';

vi.mock('motion/react', () => ({
  motion: {
    section: React.forwardRef((props, ref) => <section {...props} ref={ref} />),
    form: React.forwardRef((props, ref) => <form {...props} ref={ref} />),
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock('@/assets/icons/SearchIcon', () => ({
  SearchIcon: () => <span data-testid="search-icon" />,
}));
vi.mock('@/assets/icons/LoadingSpinner', () => ({
  LoadingSpinner: () => <span data-testid="loading-spinner" />,
}));

const mockMutate = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useHomeQueries.js', () => ({
  usePredictTextMutation: () => ({
    mutate: mockMutate,
    data: null,
    isPending: false,
    error: null,
    reset: mockReset,
  }),
}));

describe('Text Predict Form Integration Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call mutate function on form submit', async () => {
    render(<TextPredictForm />);

    const testComment = 'ini adalah komentar tes';
    const input = screen.getByPlaceholderText(/menang judi bola/i);
    const submitButton = screen.getByRole('button', { name: /analisis/i });

    expect(screen.getByText(/tidak ada teks yang diprediksi/i)).toBeInTheDocument();

    await user.type(input, testComment);
    expect(input).toHaveValue(testComment);
    await user.click(submitButton);

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate).toHaveBeenCalledWith(testComment);
  });

  it('should not call mutate if input is empty', async () => {
    render(<TextPredictForm />);
    const submitButton = screen.getByRole('button', { name: /analisis/i });

    await user.click(submitButton);
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
