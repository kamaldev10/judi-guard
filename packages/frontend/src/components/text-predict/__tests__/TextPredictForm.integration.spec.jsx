import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TextPredictForm from '../TextPredictForm';
import { create } from 'zustand';

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
vi.mock('framer-motion', () => ({
  motion: {
    section: React.forwardRef((props, ref) => <section {...props} ref={ref} />),
    form: React.forwardRef((props, ref) => <form {...props} ref={ref} />),
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// 2. Mock Ikon (di dalam komponen anak)
// Ini diperlukan agar 'TextPredictInput' tidak gagal render
vi.mock('@/assets/icons/SearchIcon', () => ({
  SearchIcon: () => <span data-testid="search-icon" />,
}));
vi.mock('@/assets/icons/LoadingSpinner', () => ({
  LoadingSpinner: () => <span data-testid="loading-spinner" />,
}));

// 3. 🔥 Mock 'useTextPredictStore' (Zustand)
// Ini adalah inti dari tes integrasi ini.

// Buat mock untuk fungsi-fungsi di dalam store
const mockAnalyze = vi.fn();
const mockClear = vi.fn();

// Buat "pabrik" untuk store tiruan
const createMockStore = () =>
  create(() => ({
    prediction: null,
    isLoading: false,
    error: null,
    analyze: mockAnalyze,
    clear: mockClear,
  }));

// Variabel untuk menampung instance store di setiap tes
let mockStore;

// Mock implementasi 'useTextPredictStore'
// Ini memberi tahu Vitest untuk menggunakan store tiruan kita
vi.mock('@/stores/textPredictStore', () => ({
  useTextPredictStore: (selector) => {
    return mockStore(selector);
  },
}));

// --- Test Suite ---

describe('Text Predict Form Integration Testing', () => {
  const user = userEvent.setup();

  // 'beforeEach' untuk me-reset store dan mock functions
  beforeEach(() => {
    // Buat store baru yang bersih untuk setiap tes
    mockStore = createMockStore();
    // Bersihkan riwayat panggilan mock
    vi.clearAllMocks();
  });

  // Tes 1: Render Awal & Interaksi Form
  it('should call analyze function from store on form submit', async () => {
    render(<TextPredictForm />);

    const testComment = 'ini adalah komentar tes';

    // Cari elemen dari 'TextPredictInput'
    const input = screen.getByPlaceholderText(/menang judi bola/i);
    const submitButton = screen.getByRole('button', { name: /analisis/i });

    // 1. Verifikasi state awal
    // (dari 'TextPredictResult')
    expect(screen.getByText(/tidak ada teks yang diprediksi/i)).toBeInTheDocument();

    // 2. Simulasikan ketikan
    await user.type(input, testComment);
    expect(input).toHaveValue(testComment); // Memastikan state internal 'inputText' bekerja

    // 3. Simulasikan submit
    await user.click(submitButton);

    // 4. Verifikasi: 'analyze' (dari store) dipanggil
    expect(mockAnalyze).toHaveBeenCalledTimes(1);
    expect(mockAnalyze).toHaveBeenCalledWith(testComment);
  });

  // Tes 2: Validasi Form
  it('should not call analyze if input is empty', async () => {
    render(<TextPredictForm />);
    const submitButton = screen.getByRole('button', { name: /analisis/i });

    // Klik tanpa mengetik
    await user.click(submitButton);
    expect(mockAnalyze).not.toHaveBeenCalled();
  });

  // Tes 3: Loading State
  it('should disable form and show loading UI when store is loading', () => {
    // 1. Atur state store tiruan
    act(() => {
      mockStore.setState({ isLoading: true });
    });

    render(<TextPredictForm />);

    // 2. Verifikasi 'TextPredictInput' (Form dinonaktifkan)
    expect(screen.getByPlaceholderText(/menang judi bola/i)).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // 3. Verifikasi 'TextPredictResult' (UI Loading)
    expect(screen.getByText(/menganalisis dengan model ai/i)).toBeInTheDocument();
  });

  // Tes 4: Error State
  it('should show error UI when store has error', () => {
    const errorMessage = 'Gagal mengambil data';

    // 1. Atur state store tiruan
    act(() => {
      mockStore.setState({ error: errorMessage });
    });

    render(<TextPredictForm />);

    // 2. Verifikasi 'TextPredictResult' (UI Error)
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(`Error: ${errorMessage}`);
  });

  // Tes 5: Prediction (Success) State & Reset Flow
  it('should show results and call clear from store on reset', async () => {
    const mockPrediction = {
      classification: 'JUDI',
      confidenceScore: 0.99,
      modelVersion: 'v2.0',
    };

    // 1. Atur state store tiruan
    act(() => {
      mockStore.setState({ prediction: mockPrediction });
    });

    render(<TextPredictForm />);

    // 2. Verifikasi 'TextPredictResult' (UI Sukses)
    expect(screen.getByText('Hasil Prediksi')).toBeInTheDocument();
    expect(screen.getByText('JUDI')).toBeInTheDocument();
    expect(screen.getByText('99.0%')).toBeInTheDocument();

    // 3. Temukan tombol Reset (di dalam TextPredictResult)
    const resetButton = screen.getByRole('button', { name: /reset hasil/i });

    // 4. Pastikan 'clear' belum dipanggil
    expect(mockClear).not.toHaveBeenCalled();

    // 5. Klik Reset
    await user.click(resetButton);

    // 6. Verifikasi: 'clear' (dari store) dipanggil
    expect(mockClear).toHaveBeenCalledTimes(1);
  });
});
