import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnimateButton from '../AnimateButton';
import userEvent from '@testing-library/user-event';

describe('Animate Button Component Testing', () => {
  // Tes 1: Memeriksa render default
  it('should render with the default text "Click Me"', () => {
    render(<AnimateButton />);

    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  // Tes 2: Memeriksa prop 'text' kustom
  it('should render with custom text provided via props', () => {
    render(<AnimateButton text="Deteksi Sekarang" />);

    const buttonElement = screen.getByRole('button', {
      name: /deteksi sekarang/i,
    });
    expect(buttonElement).toBeInTheDocument();
  });

  // Tes 3: Memeriksa keberadaan ikon SVG
  it('should render the SVG icon inside the button', () => {
    render(<AnimateButton />);

    // 1. Dapatkan tombolnya
    const buttonElement = screen.getByRole('button', { name: /click me/i });

    // 2. Gunakan querySelector untuk mencari tag 'svg' DI DALAM tombol
    const svgElement = buttonElement.querySelector('svg');

    // 3. Pastikan elemen SVG itu ada
    expect(svgElement).toBeInTheDocument();
  });

  // 4. test  props onClick
  it('should call the onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn(); // Membuat "spy" atau mock function

    render(<AnimateButton onClick={handleClick} text="Deteksi Sekarang" />);

    const buttonElement = screen.getByRole('button', {
      name: /deteksi sekarang/i,
    });

    await user.click(buttonElement);

    // Memverifikasi bahwa fungsi mock kita dipanggil
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
