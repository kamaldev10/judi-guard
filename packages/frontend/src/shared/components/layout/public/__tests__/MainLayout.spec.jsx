import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MainLayout from '../MainLayout'; // <-- Sesuaikan path impor Anda
// --- Mocking Child Components ---

// 2. Mock Header, Footer, dan Outlet
// Kita ganti komponen asli dengan placeholder sederhana
vi.mock('../Header', () => ({
  default: () => <header data-testid="mock-header">Mock Header</header>,
}));

vi.mock('../Footer', () => ({
  default: () => <footer data-testid="mock-footer">Mock Footer</footer>,
}));

// Mock Outlet agar render sesuatu yang bisa kita cari
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // Pertahankan impor asli lainnya
    Outlet: () => <div data-testid="mock-outlet">Mock Outlet Content</div>,
  };
});

// --- Test Suite ---

describe('Main Layout Component testing', () => {
  it('should render Header, Footer, and Outlet content', () => {
    // 3. Render MainLayout di dalam MemoryRouter
    render(
      <MemoryRouter>
        <MainLayout />
      </MemoryRouter>,
    );

    // 4. Verifikasi keberadaan komponen yang di-mock
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();

    // (Opsional) Verifikasi teks placeholder jika perlu
    expect(screen.getByText('Mock Header')).toBeInTheDocument();
    expect(screen.getByText('Mock Footer')).toBeInTheDocument();
    expect(screen.getByText('Mock Outlet Content')).toBeInTheDocument();
  });
});
