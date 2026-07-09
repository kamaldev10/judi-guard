import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

// Mock lucide-react icons used by Footer
vi.mock('lucide-react', () => ({
  Shield: (props) => <svg data-testid="shield-icon" {...props} />,
  Mail: (props) => <svg data-testid="mail-icon" {...props} />,
}));

// --- Test Suite ---

describe('Footer Component Testing', () => {
  const renderFooter = () => render(<Footer />, { wrapper: MemoryRouter });

  // ── Brake 🚨: Core static content renders ──

  it('should render brand name and descriptions', () => {
    renderFooter();
    expect(screen.getByText(/judi guard/i)).toBeInTheDocument();
    expect(screen.getByText(/platform pendeteksi komentar spam judi/i)).toBeInTheDocument();
    expect(screen.getByText(/say goodbye to spam judi/i)).toBeInTheDocument();
  });

  it('should render section headings', () => {
    renderFooter();
    expect(screen.getByRole('heading', { level: 2, name: /navigasi/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /bantuan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /berlangganan/i })).toBeInTheDocument();
  });

  it('should render copyright with current year', () => {
    renderFooter();
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText((_, el) => el?.textContent?.includes(`${currentYear} Judi Guard`)),
    ).toBeInTheDocument();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  // ── Engine ⚡: Navigation links with correct hrefs ──

  it('should render navigation links with correct hrefs', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /beranda/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /tentang kami/i })).toHaveAttribute(
      'href',
      '/about-us',
    );
    expect(screen.getByRole('link', { name: /analisis/i })).toHaveAttribute('href', '/analysis');
    expect(screen.getByRole('link', { name: /profil/i })).toHaveAttribute('href', '/profile');
  });

  it('should render help links with correct hrefs', () => {
    renderFooter();
    const faqLink = screen.getByRole('link', { name: /faq/i });
    expect(faqLink).toHaveAttribute('href', '/#faq');

    const contactLink = screen.getByRole('link', { name: /kontak kami/i });
    expect(contactLink).toHaveAttribute('href', '/#contact-section');
  });

  // ── Engine ⚡: Brand logo link ──

  it('should render brand link pointing to home', () => {
    renderFooter();
    const brandLink = screen.getByRole('link', { name: /judi guard.*beranda/i });
    expect(brandLink).toHaveAttribute('href', '/');
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
  });

  // ── Engine ⚡: Newsletter form ──

  it('should render an accessible newsletter form', () => {
    renderFooter();
    const emailInput = screen.getByLabelText(/email anda/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(screen.getByRole('button', { name: /kirim/i })).toBeInTheDocument();
  });

  it('should prevent default form submission', async () => {
    renderFooter();
    const form = screen.getByRole('button', { name: /kirim/i }).closest('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const prevented = !form.dispatchEvent(submitEvent);
    expect(prevented).toBe(true);
  });

  // ── Aero 🏁: Semantic nav regions with aria-labels ──

  it('should have semantic nav elements with aria-labels', () => {
    renderFooter();
    expect(screen.getByRole('navigation', { name: /navigasi footer/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /bantuan/i })).toBeInTheDocument();
  });

  // ── Aero 🏁: Responsive grid layout ──

  it('should use a responsive grid layout for footer columns', () => {
    const { container } = renderFooter();
    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid.className).toMatch(/grid-cols-1/);
    expect(grid.className).toMatch(/sm:grid-cols-2/);
    expect(grid.className).toMatch(/lg:grid-cols-4/);
  });

  // ── Aero 🏁: Accessible list roles ──

  it('should use role="list" on navigation lists', () => {
    renderFooter();
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThanOrEqual(2);
  });
});
