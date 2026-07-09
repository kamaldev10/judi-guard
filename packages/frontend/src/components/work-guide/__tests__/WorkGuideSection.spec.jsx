import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkGuideSection from '../WorkGuideSection';

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
// Kita mengganti semua komponen 'motion.' (seperti motion.section, motion.div)
// agar langsung me-render elemen HTML biasa (section, div) tanpa animasi.
vi.mock('framer-motion', () => ({
  motion: {
    section: React.forwardRef((props, ref) => <section {...props} ref={ref} />),
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
    h2: React.forwardRef((props, ref) => <h2 {...props} ref={ref} />),
  },
}));

// 2. Mock 'lucide-react' icons
// Kita ganti komponen ikon dengan SVG sederhana yang memiliki 'title'
// agar kita bisa menemukannya dengan 'getByTitle'.
vi.mock('lucide-react', () => ({
  ClipboardList: (props) => (
    <svg {...props}>
      <title>Clipboard Icon</title>
    </svg>
  ),
  ChevronRight: (props) => (
    <svg {...props}>
      <title>ChevronRight Icon</title>
    </svg>
  ),
  ArrowDown: (props) => (
    <svg {...props}>
      <title>ArrowDown Icon</title>
    </svg>
  ),
}));

// 3. Mock image assets
// Kita ganti impor gambar dengan string sederhana.
vi.mock('@/assets/images', () => ({
  LinkToYoutubeIcon: 'youtube-icon-mock.png',
  ProcessAnalysisIcon: 'analysis-icon-mock.png',
}));

// --- Test Suite ---

describe('WorkGuide Section Component Testing', () => {
  // Render komponen satu kali sebelum setiap tes
  beforeEach(() => {
    render(<WorkGuideSection />);
  });

  it('should render the main heading', () => {
    const heading = screen.getByRole('heading', {
      level: 2,
      name: /bagaimana cara kerjanya\?/i,
    });
    expect(heading).toBeInTheDocument();
  });

  // Gunakan 'it.each' untuk menguji setiap langkah secara efisien
  const stepsToTest = [
    {
      num: 1,
      title: 'input Link Video',
      desc: /masukkan link video/i,
    },
    {
      num: 2,
      title: 'Proses Analisis',
      desc: /sistem akan secara otomatis memproses/i,
    },
    {
      num: 3,
      title: 'Lihat Hasilnya',
      desc: /hasil analisis video berupa JUDI/i,
    },
  ];

  it.each(stepsToTest)(
    "should render step $num correctly with title '$title'",
    ({ num, title, desc }) => {
      // Cari elemen <h3> berdasarkan teks judulnya
      const titleElement = screen.getByText(title);
      expect(titleElement).toBeInTheDocument();
      expect(titleElement.tagName).toBe('H3');

      // Pastikan penomorannya benar (misal: "1. input Link Video")
      expect(titleElement.textContent).toContain(`${num}.`);

      // Cari elemen <p> berdasarkan teks deskripsinya
      const descriptionElement = screen.getByText(desc);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement.tagName).toBe('P');
    },
  );

  it('should render the correct icons for each step', () => {
    // Temukan ikon gambar berdasarkan 'src' yang sudah kita mock
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'youtube-icon-mock.png');
    expect(images[1]).toHaveAttribute('src', 'analysis-icon-mock.png');

    // Temukan ikon lucide berdasarkan 'title' yang sudah kita mock
    expect(screen.getByTitle('Clipboard Icon')).toBeInTheDocument();
  });

  it('should render the connector arrows (desktop and mobile)', () => {
    // Komponen me-render 2 panah (karena ada 3 langkah)
    expect(screen.getAllByTitle('ChevronRight Icon')).toHaveLength(2);
    expect(screen.getAllByTitle('ArrowDown Icon')).toHaveLength(2);
  });
});
