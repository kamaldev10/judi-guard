import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TestimonialsSection from '../TestimonialsSection';

// --- Mocking Dependencies ---

// 1. Mock framer-motion & AnimatePresence
vi.mock('framer-motion', () => ({
  motion: {
    // Ganti motion.div dengan div biasa
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
    h2: React.forwardRef(({ children, ...props }, ref) => (
      <h2 ref={ref} {...props}>
        {children}
      </h2>
    )), // Mock h2 jika Anda menggunakannya di file asli
    button: React.forwardRef(({ children, ...props }, ref) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )), // Mock button jika perlu
  },
  AnimatePresence: ({ children }) => <>{children}</>, // Langsung render children
}));

// 2. Mock lucide-react (ChevronRight)
vi.mock('lucide-react', () => ({
  ChevronRight: (props) => <svg data-testid="next-icon" {...props} />,
}));

// 3. Mock TestimonialCard
// Kita buat placeholder yang menampilkan nama author agar mudah diverifikasi
vi.mock('@/components/testimonial/TestimonialCard', () => ({
  default: ({ testimonial }) => (
    <div data-testid={`testimonial-card-${testimonial.id}`}>
      <p>{testimonial.quote}</p>
      <p>{testimonial.author}</p>
      <img src={testimonial.avatarUrl} alt={testimonial.author} />
    </div>
  ),
}));

// 4. Mock data konstanta (testimonialsData)
vi.mock('@/constants', () => ({
  testimonialsData: [
    {
      id: 1,
      quote: 'Q1',
      author: 'Author 1',
      title: 'T1',
      avatarUrl: 'a1.jpg',
    },
    {
      id: 2,
      quote: 'Q2',
      author: 'Author 2',
      title: 'T2',
      avatarUrl: 'a2.jpg',
    },
    {
      id: 3,
      quote: 'Q3',
      author: 'Author 3',
      title: 'T3',
      avatarUrl: 'a3.jpg',
    },
    {
      id: 4,
      quote: 'Q4',
      author: 'Author 4',
      title: 'T4',
      avatarUrl: 'a4.jpg',
    },
  ],
}));

// --- Test Suite ---

describe('Testimonials Section Integration Testing', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Bersihkan mock jika ada state internal (tidak ada di sini, tapi best practice)
    vi.clearAllMocks();
  });

  it('should render the section title and initial two testimonials', () => {
    render(<TestimonialsSection />);

    // Cek judul section
    expect(
      screen.getByRole('heading', { level: 2, name: /testimoni pengguna/i }),
    ).toBeInTheDocument();

    // Cek tombol next
    expect(
      screen.getByRole('button', { name: /tampilkan testimonial berikutnya/i }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('next-icon')).toBeInTheDocument(); // Cek ikon

    // Cek dua testimoni awal (berdasarkan author dari mock data)
    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();

    // Pastikan testimoni lain tidak ada
    expect(screen.queryByText('Author 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Author 4')).not.toBeInTheDocument();
  });

  it('should show the next two testimonials when the next button is clicked', async () => {
    render(<TestimonialsSection />);

    // Pastikan state awal benar
    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();
    expect(screen.queryByText('Author 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Author 4')).not.toBeInTheDocument();

    // Klik tombol next
    const nextButton = screen.getByRole('button', {
      name: /tampilkan testimonial berikutnya/i,
    });
    await user.click(nextButton);

    // Tunggu update DOM (karena ada state change)
    // Cek apakah testimoni berikutnya muncul
    expect(await screen.findByText('Author 3')).toBeInTheDocument();
    expect(screen.getByText('Author 4')).toBeInTheDocument();

    // Pastikan testimoni awal sudah hilang
    expect(screen.queryByText('Author 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Author 2')).not.toBeInTheDocument();
  });

  it('should loop back to the first two testimonials after reaching the end', async () => {
    render(<TestimonialsSection />);

    const nextButton = screen.getByRole('button', {
      name: /tampilkan testimonial berikutnya/i,
    });

    // Klik pertama -> tampilkan 3 & 4
    await user.click(nextButton);
    expect(await screen.findByText('Author 3')).toBeInTheDocument();
    expect(screen.getByText('Author 4')).toBeInTheDocument();
    expect(screen.queryByText('Author 1')).not.toBeInTheDocument();

    // Klik kedua -> loop kembali ke 1 & 2
    await user.click(nextButton);
    expect(await screen.findByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();

    // Pastikan testimoni terakhir sudah hilang
    expect(screen.queryByText('Author 3')).not.toBeInTheDocument();
    expect(screen.queryByText('Author 4')).not.toBeInTheDocument();
  });
});
