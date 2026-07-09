import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalysisLegend from '../AnalysisLegend';

// --- Mock Data ---

// 2. Buat data payload tiruan (struktur sesuai propTypes)
const mockPayload = [
  {
    value: 'JUDI', // Nama kategori
    color: 'rgb(239, 68, 68)', // Warna (contoh: merah)
    payload: {
      name: 'JUDI',
      value: 150, // Jumlah komentar
      percent: 0.75, // Persentase (0-1) -> 75%
    },
  },
  {
    value: 'NON_JUDI',
    color: 'rgb(34, 197, 94)', // Warna (contoh: hijau)
    payload: {
      name: 'NON_JUDI',
      value: 50,
      percent: 0.25, // -> 25%
    },
  },
];

// --- Test Suite ---

describe('Analysis Legend Component Testing', () => {
  // Tes 1: Payload Kosong/Null
  it('should render null when payload is empty or null', () => {
    // Tes dengan payload array kosong
    const { container: containerEmpty, rerender } = render(<AnalysisLegend payload={[]} />);
    expect(containerEmpty.firstChild).toBeNull();

    // Tes dengan payload null
    rerender(<AnalysisLegend payload={null} />);
    expect(containerEmpty.firstChild).toBeNull();

    // Tes dengan payload undefined
    rerender(<AnalysisLegend payload={undefined} />);
    expect(containerEmpty.firstChild).toBeNull();
  });

  // Tes 2: Render dengan Payload Valid
  describe('when rendered with valid payload', () => {
    beforeEach(() => {
      // Render komponen dengan data mock
      render(<AnalysisLegend payload={mockPayload} />);
    });

    it('should render the correct number of list items', () => {
      // Cari semua elemen list item (li)
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(mockPayload.length); // Harus ada 2 item
    });

    it('should render each item with color span, name, and percentage', () => {
      mockPayload.forEach((entry) => {
        // Cari list item berdasarkan nama kategorinya
        const listItem = screen.getByText(entry.value).closest('li');
        expect(listItem).toBeInTheDocument();

        // Gunakan 'within' untuk mencari di dalam list item
        const withinItem = within(listItem);

        // 1. Cek Span Warna
        // Cari span berdasarkan class atau style
        const colorSpan = listItem.querySelector('span[style*="background-color"]');
        expect(colorSpan).toBeInTheDocument();
        expect(colorSpan).toHaveStyle(`backgroundColor: ${entry.color}`);
        expect(colorSpan).toHaveClass('w-3 h-3'); // Cek class ukuran

        // 2. Cek Nama Kategori (value)
        expect(withinItem.getByText(entry.value)).toBeInTheDocument();

        // 3. Cek Persentase
        const expectedPercent = `${(entry.payload.percent * 100).toFixed(0)}%`; // Misal: "75%"
        expect(withinItem.getByText(expectedPercent)).toBeInTheDocument();
      });
    });
  });
});
