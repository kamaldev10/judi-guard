import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle from '../ThemeToggle';

// --- Mocking Dependencies ---

// 1. Mock 'next-themes'
//    Kita buat ini bisa dikontrol dari dalam tes
let currentTheme = 'light'; // Default
const mockSetTheme = vi.fn((newTheme) => {
  currentTheme = newTheme; // Simulasikan perubahan tema saat setTheme dipanggil
});
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: currentTheme, // Gunakan variabel yang bisa diubah
    setTheme: mockSetTheme,
  }),
}));

// 2. Mock 'framer-motion' and 'AnimatePresence'
vi.mock('framer-motion', () => ({
  motion: {
    // Mock 'div' karena ikon dibungkus di dalamnya
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div {...props} ref={ref}>
        {children}
      </div>
    )),
  },
  // Mock AnimatePresence agar langsung render children
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// 3. Mock 'lucide-react' icons
vi.mock('lucide-react', () => ({
  Sun: (props) => <svg data-testid="sun-icon" {...props} />,
  Moon: (props) => <svg data-testid="moon-icon" {...props} />,
  // Laptop tidak lagi digunakan, tapi tidak masalah jika masih ada
  Laptop: (props) => <svg data-testid="laptop-icon" {...props} />,
}));

// 4. Mock Button component
//    Pastikan path ini benar!
vi.mock('@/components/ui/Button', () => ({
  Button: React.forwardRef(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  )),
}));

// --- Test Suite ---

describe('Theme Toggle Integration Testing', () => {
  const user = userEvent.setup();

  // Helper untuk render dengan tema spesifik dan mensimulasikan 'mounted'
  // Kita perlu me-mount ulang komponen agar useEffect berjalan
  const renderToggle = (initialTheme = 'light') => {
    currentTheme = initialTheme; // Set tema awal untuk mock useTheme
    const { rerender } = render(<ThemeToggle />);
    // Simulasikan useEffect berjalan setelah render awal
    act(() => {
      // Ini akan memicu state 'mounted' menjadi true
      rerender(<ThemeToggle />);
    });
    return { rerender }; // Kembalikan rerender jika perlu
  };

  beforeEach(() => {
    // Reset mock dan state tema sebelum setiap tes
    vi.clearAllMocks();
    currentTheme = 'light'; // Reset ke default
  });

  // Tes 1: Render Light Theme
  it('should render Sun icon when theme is light', () => {
    renderToggle('light'); // Render dan mount dengan tema light

    // Cari tombol
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    // Verifikasi ikon Sun ada, Moon tidak ada
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
  });

  // Tes 2: Render Dark Theme
  it('should render Moon icon when theme is dark', () => {
    renderToggle('dark'); // Render dan mount dengan tema dark

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    // Verifikasi ikon Moon ada, Sun tidak ada
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
  });

  // Tes 3: Klik (Light -> Dark)
  it("should call setTheme with 'dark' when clicked and current theme is 'light'", async () => {
    renderToggle('light');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    // Verifikasi setTheme dipanggil dengan 'dark'
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  // Tes 4: Klik (Dark -> Light)
  it("should call setTheme with 'light' when clicked and current theme is 'dark'", async () => {
    renderToggle('dark');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    // Verifikasi setTheme dipanggil dengan 'light'
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
