import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FunFactsSection from '../FunFactsSection';

// --- Mocking Dependencies ---

// 2. Mock framer-motion (komponen & hooks)
const mockPathHeightValue = '75%'; // Nilai statis untuk style
vi.mock('framer-motion', () => ({
  motion: {
    section: React.forwardRef((props, ref) => <section {...props} ref={ref} />),
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
    h2: React.forwardRef((props, ref) => <h2 {...props} ref={ref} />),
    p: React.forwardRef((props, ref) => <p {...props} ref={ref} />),
    // Mock elemen yang digunakan di FactCard juga, karena kita tidak mock FactCard secara terpisah
    h3: React.forwardRef((props, ref) => <h3 {...props} ref={ref} />),
    span: React.forwardRef((props, ref) => <span {...props} ref={ref} />),
    img: React.forwardRef((props, ref) => <img {...props} ref={ref} />),
  },
  useScroll: vi.fn(() => ({ scrollYProgress: { get: () => 0.5 } })),
  useTransform: vi.fn(() => mockPathHeightValue), // Kembalikan nilai string
}));

// 3. Mock data konstanta (factsData) - Definisikan di dalam mock
vi.mock('@/constants', () => ({
  factsData: [
    {
      id: 101,
      icon: '💡',
      title: 'Fakta Mock 1',
      text: 'Teks fakta mock 1',
      image: 'mock1.jpg',
    },
    {
      id: 102,
      icon: '🚀',
      title: 'Fakta Mock 2',
      text: 'Teks fakta mock 2',
      image: 'mock2.jpg',
    },
  ],
}));

// 4. Mock FactCard (Pastikan path relatif ini benar!)
//    Kita mock file tempat FactCard diekspor
vi.mock('../FactCard', () => ({
  // <-- Sesuaikan path ke file FactCard.jsx
  FactCard: (
    { fact }, // Gunakan nama ekspor (FactCard)
  ) => (
    <div data-testid={`fact-card-${fact.id}`}>
      <h3>{fact.title}</h3>
      <p>{fact.text}</p>
      <img src={fact.image} alt={fact.title} />
      <span>{fact.icon}</span>
    </div>
  ),
}));

// --- Test Suite ---

describe('FunFactsSection Integration Test', () => {
  // Ambil data mock untuk digunakan dalam tes
  // Kita perlu cara untuk mengakses data yang sama dengan yang digunakan oleh mock
  // Cara mudah: definisikan ulang di sini
  const currentMockData = [
    {
      id: 101,
      icon: '💡',
      title: 'Fakta Mock 1',
      text: 'Teks fakta mock 1',
      image: 'mock1.jpg',
    },
    {
      id: 102,
      icon: '🚀',
      title: 'Fakta Mock 2',
      text: 'Teks fakta mock 2',
      image: 'mock2.jpg',
    },
  ];

  beforeEach(() => {
    // Render komponen sebelum setiap tes
    render(<FunFactsSection />);
  });

  it('should render the main title and subtitle', () => {
    expect(
      screen.getByRole('heading', { level: 2, name: /fakta di balik layar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/mengungkap sisi lain dari dunia perjudian yang jarang diketahui/i),
    ).toBeInTheDocument();
  });

  it('should render the static and dynamic timeline elements', () => {
    expect(screen.getByTestId('timeline-background')).toBeInTheDocument();
    const dynamicLine = screen.getByTestId('timeline-dynamic');
    expect(dynamicLine).toBeInTheDocument();
    expect(dynamicLine).toHaveStyle(`height: ${mockPathHeightValue}`);
  });

  it('should render the correct number of timeline markers', () => {
    const markers = screen.getAllByTestId('timeline-marker');
    expect(markers).toHaveLength(currentMockData.length);
  });

  it('should render the correct number of FactCard components (mocked)', () => {
    const cards = screen.getAllByTestId(/fact-card-/i);
    expect(cards).toHaveLength(currentMockData.length);
  });

  it('should render each FactCard with the correct fact data', () => {
    currentMockData.forEach((fact) => {
      const cardContainer = screen.getByTestId(`fact-card-${fact.id}`);
      // Verifikasi konten di dalam kartu mock
      expect(
        within(cardContainer).getByRole('heading', {
          level: 3,
          name: fact.title,
        }),
      ).toBeInTheDocument();
      expect(within(cardContainer).getByText(fact.text)).toBeInTheDocument();
      expect(within(cardContainer).getByAltText(fact.title)).toHaveAttribute('src', fact.image);
      expect(within(cardContainer).getByText(fact.icon)).toBeInTheDocument();
    });
  });
});
