import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormattedDate } from '../formatters'; // <-- Sesuaikan path impor Anda

describe('FormattedDate Component', () => {
  // Tes 1: Render tanggal valid
  it('should render formatted date and time for a valid ISO string', () => {
    const validIsoDate = '2025-10-27T10:30:00Z'; // Contoh UTC
    render(<FormattedDate isoDate={validIsoDate} />);

    // Cari elemen <time>
    const timeElement = screen.getByText(/27 Okt 2025/i); // Cari bagian tanggal
    expect(timeElement).toBeInTheDocument();
    expect(timeElement.tagName).toBe('TIME');

    // Pastikan atribut dateTime benar
    expect(timeElement).toHaveAttribute('dateTime', validIsoDate);

    // Pastikan format waktu juga ada (Contoh: 17.30 untuk WIB dari UTC+0)
    // Note: Hasil toLocaleTimeString bisa bervariasi tergantung timezone JSDOM/Node.
    // Gunakan regex yang lebih fleksibel atau mock Date jika perlu konsistensi absolut.
    expect(screen.getByText(/17.30/)).toBeInTheDocument(); // Sesuaikan jam jika perlu
    // Alternatif Regex:
    // expect(screen.getByText(/\d{2}.\d{2}/)).toBeInTheDocument();
  });

  // Tes 2: Render tanpa prop isoDate
  it('should render a placeholder when isoDate prop is missing or null', () => {
    // Render tanpa prop
    const { rerender } = render(<FormattedDate />);
    expect(screen.getByText('-')).toBeInTheDocument();

    // Render ulang dengan null
    rerender(<FormattedDate isoDate={null} />);
    expect(screen.getByText('-')).toBeInTheDocument();

    // Render ulang dengan undefined
    rerender(<FormattedDate isoDate={undefined} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  // Tes 3: Render dengan string tanggal tidak valid
  it('should render an error message for an invalid date string', () => {
    render(<FormattedDate isoDate="ini-bukan-tanggal" />);

    // Cari pesan error
    expect(screen.getByText(/tanggal error/i)).toBeInTheDocument();
  });
});
