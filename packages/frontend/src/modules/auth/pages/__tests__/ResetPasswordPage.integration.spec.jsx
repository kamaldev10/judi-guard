import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, useParams } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import ResetPasswordPage from '../ResetPasswordPage';
import ResetPasswordForm from '../../components/ResetPasswordForm.jsx';
import { toast } from 'react-toastify';

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

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

let capturedOnInvalidToken = null;
vi.mock('../../components/ResetPasswordForm.jsx', () => ({
  default: vi.fn(({ token, onInvalidToken }) => {
    capturedOnInvalidToken = onInvalidToken;
    return <div data-testid="mock-reset-form">Mock Form (Token: {token})</div>;
  }),
}));

describe('Reset Password Page Integration Testing', () => {
  const renderPage = (route = '/reset-password/some-token') => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[route]}>
          <ResetPasswordPage />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';
    capturedOnInvalidToken = null;
    vi.mocked(useParams).mockClear();
  });

  it('should render the form when a token is present in the URL', () => {
    const testToken = 'valid-token-123';
    vi.mocked(useParams).mockReturnValue({ token: testToken });

    renderPage(`/reset-password/${testToken}`);

    expect(document.title).toBe('Reset Password | Judi Guard');

    const mockForm = screen.getByTestId('mock-reset-form');
    expect(mockForm).toBeInTheDocument();
    expect(mockForm).toHaveTextContent(`Mock Form (Token: ${testToken})`);

    expect(screen.queryByRole('heading', { name: /token tidak valid/i })).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should render error UI and call toast if token is missing', () => {
    vi.mocked(useParams).mockReturnValue({ token: undefined });

    renderPage('/reset-password/');

    expect(screen.getByRole('heading', { name: /token tidak valid/i })).toBeInTheDocument();
    expect(
      screen.getByText(/token reset kata sandi yang anda gunakan tidak valid/i),
    ).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /minta reset kata sandi baru/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: /kembali ke login/i })).toHaveAttribute(
      'href',
      '/login',
    );

    expect(screen.queryByTestId('mock-reset-form')).not.toBeInTheDocument();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Token reset tidak ditemukan'),
      expect.any(Object),
    );
  });

  it('should switch to error UI when child form calls onInvalidToken', () => {
    const testToken = 'invalid-token-456';
    vi.mocked(useParams).mockReturnValue({ token: testToken });

    renderPage(`/reset-password/${testToken}`);

    expect(screen.getByTestId('mock-reset-form')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /token tidak valid/i })).not.toBeInTheDocument();
    expect(capturedOnInvalidToken).toBeInstanceOf(Function);

    act(() => {
      capturedOnInvalidToken();
    });

    expect(screen.queryByTestId('mock-reset-form')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /token tidak valid/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /minta reset kata sandi baru/i })).toBeInTheDocument();
  });
});
