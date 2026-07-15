import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // 1. Impor MemoryRouter
import HeroSection from '../HeroSection'; // <-- Sesuaikan path impor

// --- Mocking Dependencies ---

// 2. Mock 'motion/react'
// Ganti komponen motion dengan elemen HTML biasa
vi.mock('motion/react', () => ({
  motion: {
    section: React.forwardRef((props, ref) => <section {...props} ref={ref} />),
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
    h1: React.forwardRef((props, ref) => <h1 {...props} ref={ref} />),
    p: React.forwardRef((props, ref) => <p {...props} ref={ref} />),
    img: React.forwardRef((props, ref) => <img {...props} ref={ref} />), // Jika Anda pakai motion.img
    button: React.forwardRef((props, ref) => <button {...props} ref={ref} />), // Jika Anda pakai motion.button
  },
}));

// 3. Mock image import
// Ganti path aktual dengan path mock
vi.mock('@/assets/images/HeroImage.png', () => ({
  default: 'hero-image-mock.png', // Path string sederhana
}));

// 4. Mock komponen anak (Tagline, AnimateButton)
vi.mock('@/modules/home/components/tagline/Tagline', () => ({
  default: () => <div data-testid="mock-tagline">Mock Tagline</div>,
}));
// Mock AnimateButton agar meneruskan onClick
vi.mock('@/shared/components/ui/AnimateButton', () => ({
  // Pastikan mock menerima dan menggunakan onClick
  default: ({ text, onClick }) => (
    <button data-testid="mock-animate-button" onClick={onClick}>
      {text}
    </button>
  ),
}));

// 5. Mock 'react-scroll' (ScrollLink)
// Ganti ScrollLink agar hanya me-render children-nya
vi.mock('react-scroll', () => ({
  Link: ({ children, ...props }) => <div {...props}>{children}</div>, // Render div sederhana
}));

// 6. Mock 'react-router-dom' hooks (useNavigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Pertahankan impor asli lain (Link, dll.)
    useNavigate: () => mockNavigate, // Ganti useNavigate dengan mock
  };
});

// --- Test Suite ---

describe('HeroSection Integration Test', () => {
  const user = userEvent.setup();

  // Helper untuk render dengan Router
  const renderHeroSection = () => {
    return render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    );
  };

  // Reset mocks sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render static content correctly', () => {
    renderHeroSection();

    // Cek Judul Utama
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /pendeteksi komentar judi online/i,
      }),
    ).toBeInTheDocument();

    // Cek Subjudul
    expect(
      screen.getByText(/dengan cepat dan akurat melindungi ruang digital anda/i),
    ).toBeInTheDocument();

    // Cek Gambar
    const heroImage = screen.getByAltText(/ilustrasi deteksi komentar judi/i);
    expect(heroImage).toBeInTheDocument();
    expect(heroImage).toHaveAttribute('src', 'hero-image-mock.png');

    // Cek Mock Tagline
    expect(screen.getByTestId('mock-tagline')).toBeInTheDocument();
    expect(screen.getByText('Mock Tagline')).toBeInTheDocument();

    // Cek Mock AnimateButton
    expect(screen.getByTestId('mock-animate-button')).toBeInTheDocument();
    expect(screen.getByText('Deteksi Sekarang')).toBeInTheDocument();
  });

  it("should call navigate to /analysis when 'Deteksi Sekarang' button is clicked", async () => {
    renderHeroSection();

    // Cari tombol (yang sudah di-mock) berdasarkan testid atau teks
    const detectButton = screen.getByTestId('mock-animate-button');
    // const detectButton = screen.getByRole('button', { name: /deteksi sekarang/i }); // Alternatif

    // Simulasikan klik
    await user.click(detectButton);

    // Verifikasi mockNavigate dipanggil dengan path yang benar
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/analysis');
  });
});
