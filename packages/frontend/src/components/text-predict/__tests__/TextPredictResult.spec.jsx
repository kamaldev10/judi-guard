import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextPredictResult from '../TextPredictResult';

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion' dan 'AnimatePresence'
// Kita ganti agar langsung me-render children tanpa animasi.
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef((props, ref) => (
      <div {...props} ref={ref} /> // Render div biasa
    )),
  },
  AnimatePresence: ({ children }) => <>{children}</>, // Render children-nya saja
}));

// --- Mock Data ---

// 2. Buat mock function untuk prop 'clear'
const mockClear = vi.fn();

// 3. Buat data prediksi tiruan
const judiPrediction = {
  classification: 'JUDI',
  confidenceScore: 0.952, // 95.2%
  modelVersion: 'v1.2.3',
};

// --- Test Suite ---

describe('Text Predict Result Component Testing', () => {
  // Bersihkan riwayat mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: Initial State
  it('should render the initial state message', () => {
    render(
      <TextPredictResult isLoading={false} error={null} prediction={null} clear={mockClear} />,
    );

    // Verifikasi pesan awal
    expect(screen.getByText(/tidak ada teks yang diprediksi/i)).toBeInTheDocument();

    // Pastikan state lain tidak ter-render
    expect(screen.queryByText(/menganalisis/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(/hasil prediksi/i)).not.toBeInTheDocument();
  });

  // Tes 2: Loading State
  it('should render the loading message when isLoading is true', () => {
    render(<TextPredictResult isLoading={true} error={null} prediction={null} clear={mockClear} />);

    // Verifikasi pesan loading
    expect(screen.getByText(/menganalisis dengan model ai/i)).toBeInTheDocument();

    // Pastikan state lain tidak ter-render
    expect(screen.queryByText(/tidak ada teks yang diprediksi/i)).not.toBeInTheDocument();
  });

  // Tes 3: Error State
  it('should render the error message when error is present', () => {
    const errorMessage = 'Model gagal merespons';
    render(
      <TextPredictResult
        isLoading={false}
        error={errorMessage}
        prediction={null}
        clear={mockClear}
      />,
    );

    // Verifikasi pesan error
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(`Error: ${errorMessage}`);
  });

  // Tes 4: Prediction (Success) State
  describe('when a prediction is provided', () => {
    const user = userEvent.setup();

    it('should render all prediction data correctly', () => {
      render(
        <TextPredictResult
          prediction={judiPrediction}
          isLoading={false}
          error={null}
          clear={mockClear}
        />,
      );

      // Verifikasi header kartu
      expect(screen.getByText('Hasil Prediksi')).toBeInTheDocument();
      expect(screen.getByText(`Model: ${judiPrediction.modelVersion}`)).toBeInTheDocument();

      // Verifikasi klasifikasi
      expect(screen.getByText(judiPrediction.classification)).toBeInTheDocument();

      // Verifikasi confidence score (pastikan formatnya benar)
      expect(screen.getByText('95.2%')).toBeInTheDocument();

      // Verifikasi tombol reset ada
      expect(screen.getByRole('button', { name: /reset hasil/i })).toBeInTheDocument();
    });

    it("should call 'clear' prop when Reset button is clicked", async () => {
      render(
        <TextPredictResult
          prediction={judiPrediction}
          isLoading={false}
          error={null}
          clear={mockClear}
        />,
      );

      const resetButton = screen.getByRole('button', { name: /reset hasil/i });
      await user.click(resetButton);

      // Verifikasi mock function dipanggil
      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });
});
