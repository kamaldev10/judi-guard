import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactInfoList from '../ContactInfoList'; // <-- Sesuaikan path

// --- Mocking Dependencies ---
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
}));

// --- Mock Data ---
const mockContactInfo = [
  {
    icon: <span data-testid="mock-icon-mail">✉️</span>,
    text: 'kontak@email.com',
    href: 'mailto:kontak@email.com',
  },
  {
    icon: <span data-testid="mock-icon-phone">📞</span>,
    text: '+123456789',
    href: 'tel:+123456789',
  },
  {
    icon: <span data-testid="mock-icon-location">📍</span>,
    text: 'Lokasi Tes',
  },
];

// --- Test Suite ---
describe('Contact Info List Component Testing', () => {
  it('should render the heading correctly', () => {
    // 👇 Panggil render DI SINI
    render(<ContactInfoList contactInfo={mockContactInfo} />);
    expect(
      screen.getByRole('heading', { level: 3, name: /informasi kontak/i }),
    ).toBeInTheDocument();
  });

  it('should render the correct number of list items', () => {
    // 👇 Panggil render DI SINI
    render(<ContactInfoList contactInfo={mockContactInfo} />);
    const items = screen.getAllByText(/kontak@email.com|Lokasi Tes|\+123456789/);
    expect(items).toHaveLength(mockContactInfo.length);
  });

  it('should render icons for each list item', () => {
    // 👇 Panggil render DI SINI
    render(<ContactInfoList contactInfo={mockContactInfo} />);
    expect(screen.getByTestId('mock-icon-mail')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon-phone')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon-location')).toBeInTheDocument();
  });

  it('should render links for items with href', () => {
    // 👇 Panggil render DI SINI
    render(<ContactInfoList contactInfo={mockContactInfo} />);
    const emailLink = screen.getByRole('link', {
      name: mockContactInfo[0].text,
    });
    expect(emailLink).toHaveAttribute('href', mockContactInfo[0].href);
    const phoneLink = screen.getByRole('link', {
      name: mockContactInfo[1].text,
    });
    expect(phoneLink).toHaveAttribute('href', mockContactInfo[1].href);
  });

  it('should render paragraphs for items without href', () => {
    // 👇 Panggil render DI SINI
    render(<ContactInfoList contactInfo={mockContactInfo} />);
    const locationText = screen.getByText(mockContactInfo[2].text);
    expect(locationText.tagName).toBe('P');
    expect(screen.queryByRole('link', { name: mockContactInfo[2].text })).not.toBeInTheDocument();
  });

  // Tes yang gagal sebelumnya (sekarang seharusnya lolos)
  it('should render nothing except heading if contactInfo is empty', () => {
    // Render ulang dengan array kosong (ini sudah benar)
    render(<ContactInfoList contactInfo={[]} />);

    // Heading tetap ada (SEKARANG HANYA ADA SATU)
    expect(
      screen.getByRole('heading', { level: 3, name: /informasi kontak/i }),
    ).toBeInTheDocument();

    // Pastikan tidak ada teks dari data mock sebelumnya
    expect(screen.queryByText('kontak@email.com')).not.toBeInTheDocument();
    expect(screen.queryByText('+123456789')).not.toBeInTheDocument();
    expect(screen.queryByText('Lokasi Tes')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-icon-mail')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-icon-phone')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-icon-location')).not.toBeInTheDocument();
  });
});
