import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalysisTooltip from '../AnalysisTooltip'; // <-- Sesuaikan path impor Anda

// --- Mock Data ---

// 1. Buat data payload tiruan (struktur sesuai propTypes)
const mockPayload = [
  {
    name: 'JUDI', // Nama kategori
    value: 1500, // Nilai numerik (jumlah)
    color: '#EF4444', // Warna slice (merah)
    payload: {
      // Data objek asli
      percent: 0.75, // Persentase (0-1) -> 75.0%
      // ... data lain mungkin ada di sini
    },
  },
  // Recharts mengirim array, tapi tooltip biasanya hanya pakai item pertama
];

const mockPayloadNonJudi = [
  {
    name: 'NON_JUDI',
    value: 500,
    color: '#22C55E', // Warna slice (hijau)
    payload: {
      percent: 0.25, // -> 25.0%
    },
  },
];

// --- Test Suite ---

describe('Analysis Tooltip Component Testing', () => {
  // Tes 1: State Tidak Aktif
  it("should render null when 'active' prop is false", () => {
    // Render dengan active=false. 'container' adalah elemen div terluar
    const { container } = render(<AnalysisTooltip active={false} payload={mockPayload} />);
    // Komponen harus me-return null, jadi 'container' harus kosong
    expect(container.firstChild).toBeNull();
  });

  // Tes 2: Payload Kosong
  it("should render null when 'payload' prop is empty or null", () => {
    // Tes dengan payload array kosong
    const { container: containerEmpty } = render(<AnalysisTooltip active={true} payload={[]} />);
    expect(containerEmpty.firstChild).toBeNull();

    // Tes dengan payload null
    const { container: containerNull } = render(<AnalysisTooltip active={true} payload={null} />);
    expect(containerNull.firstChild).toBeNull();
  });

  // Tes 3: State Aktif - Render Data
  describe('when active and payload are valid', () => {
    beforeEach(() => {
      // Render komponen dengan props aktif untuk tes di dalam describe ini
      render(<AnalysisTooltip active={true} payload={mockPayload} />);
    });

    it('should render the category name with the correct color', () => {
      // Cari elemen berdasarkan nama kategori
      const nameElement = screen.getByText(mockPayload[0].name); // "JUDI"
      expect(nameElement).toBeInTheDocument();
      // Verifikasi style warna inline
      expect(nameElement).toHaveStyle(`color: ${mockPayload[0].color}`);
    });

    it('should render the formatted value (count)', () => {
      // Cari elemen berdasarkan teks "Jumlah:" lalu cek sibling/parentnya
      // Atau cari langsung teks value yang sudah diformat
      const valueText = mockPayload[0].value.toLocaleString(); // "1,500"
      expect(screen.getByText(valueText)).toBeInTheDocument();
      // Pastikan labelnya juga ada
      expect(screen.getByText(/jumlah:/i)).toBeInTheDocument();
    });

    it('should render the formatted percentage', () => {
      // Hitung dan format persentase
      const percentageText = `${(mockPayload[0].payload.percent * 100).toFixed(1)}%`; // "75.0%"
      expect(screen.getByText(percentageText)).toBeInTheDocument();
      // Pastikan labelnya juga ada
      expect(screen.getByText(/persentase:/i)).toBeInTheDocument();
    });
  });

  // Tes 4: State Aktif - Data Berbeda (opsional, untuk memastikan fleksibilitas)
  it('should render correctly with different payload data', () => {
    render(<AnalysisTooltip active={true} payload={mockPayloadNonJudi} />);

    const nameElement = screen.getByText(mockPayloadNonJudi[0].name); // "NON_JUDI"
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveStyle(`color: ${mockPayloadNonJudi[0].color}`);

    const valueText = mockPayloadNonJudi[0].value.toLocaleString(); // "500"
    expect(screen.getByText(valueText)).toBeInTheDocument();

    const percentageText = `${(mockPayloadNonJudi[0].payload.percent * 100).toFixed(1)}%`; // "25.0%"
    expect(screen.getByText(percentageText)).toBeInTheDocument();
  });
});
