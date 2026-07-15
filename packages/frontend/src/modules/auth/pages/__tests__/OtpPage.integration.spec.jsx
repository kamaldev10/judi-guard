import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HeadProvider } from 'react-head';
import OtpPage from '../OtpPage';
import OtpForm from '../../components/OtpForm.jsx';
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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/assets/images', () => ({
  LogoWithSlogan: 'mock-logo-with-slogan.png',
}));

vi.mock('../../components/OtpForm.jsx', () => ({
  default: vi.fn(({ email }) => <div data-testid="mock-otp-form">Mock OTP Form for {email}</div>),
}));

describe('Otp Page Integration Testing', () => {
  const renderPage = (routeState = null) => {
    return render(
      <HeadProvider>
        <MemoryRouter initialEntries={[{ pathname: '/otp', state: routeState }]}>
          <OtpPage />
        </MemoryRouter>
      </HeadProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.title = '';

    if (vi.isMockFunction(OtpForm)) {
      OtpForm.mockClear();
    }
  });

  it('should render the title, logo, and OtpForm when email is provided in state', () => {
    const testEmail = 'test@example.com';
    renderPage({ email: testEmail });

    expect(document.title).toBe('Verifikasi OTP | Judi Guard');

    const logoImage = screen.getByAltText('Judi Guard Logo');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', 'mock-logo-with-slogan.png');

    const mockForm = screen.getByTestId('mock-otp-form');
    expect(mockForm).toBeInTheDocument();

    expect(OtpForm).toHaveBeenCalledTimes(1);

    const firstCallArgs = OtpForm.mock.calls[0];
    expect(firstCallArgs.length).toBe(2);

    const receivedProps = firstCallArgs[0];
    expect(receivedProps).toEqual(expect.objectContaining({ email: testEmail }));

    expect(toast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.queryByText(/memuat atau terjadi kesalahan/i)).not.toBeInTheDocument();
  });

  it('should show fallback text, call toast.error, and navigate if email is missing', () => {
    renderPage(null);

    expect(screen.getByText(/memuat atau terjadi kesalahan/i)).toBeInTheDocument();
    expect(screen.queryByTestId('mock-otp-form')).not.toBeInTheDocument();

    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'Email tidak ditemukan, harap registrasi ulang.',
      expect.any(Object),
    );

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
    expect(document.title).not.toBe('Verifikasi OTP | Judi Guard');
  });
});
