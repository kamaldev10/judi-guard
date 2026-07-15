import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import ForgotPasswordPage from '../ForgotPasswordPage';

// --- Mocking Dependencies ---

vi.mock('react-head', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Title: ({ children }) => {
      document.title = children;
      return null;
    },
  };
});

vi.mock('../../components/ForgotPasswordForm.jsx', () => ({
  default: () => <div data-testid="mock-forgot-password-form">Mock Forgot Password Form</div>,
}));

describe('Forgot Password Page Integration Testing', () => {
  const renderPage = () => {
    return render(
      <HeadProvider>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
  });

  it('should render the title, mock form, and login link', () => {
    renderPage();

    expect(document.title).toBe('Lupa Password | Judi Guard');
    expect(screen.getByTestId('mock-forgot-password-form')).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
