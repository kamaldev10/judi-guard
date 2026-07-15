import React from 'react';
import { render, screen, fireEvent, waitFor, act, configure } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ForgotPasswordForm from '../ForgotPasswordForm';
import { useForgotPasswordMutation } from '../hooks/useAuthMutations.js';
import Swal from 'sweetalert2';

configure({ testIdAttribute: 'data-cy' });

const { mockNavigate, mockForgotPassword } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockForgotPassword: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

vi.mock('../hooks/useAuthMutations.js', () => ({
  useForgotPasswordMutation: vi.fn(),
}));

describe('ForgotPasswordForm Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useForgotPasswordMutation.mockReturnValue({
      mutateAsync: mockForgotPassword,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => {
    return render(<ForgotPasswordForm />);
  };

  it('renders the form correctly', () => {
    setup();

    expect(screen.getByText('Lupa Kata Sandi?')).toBeInTheDocument();
    expect(screen.getByText(/Jangan khawatir! Masukkan alamat email Anda/i)).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kirim Instruksi Reset/i })).toBeInTheDocument();
  });

  it('shows validation warning if email is empty', async () => {
    setup();

    const submitBtn = screen.getByTestId('send-instructions-button');
    fireEvent.submit(submitBtn.closest('form'));

    expect(mockForgotPassword).not.toHaveBeenCalled();

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Input Tidak Valid',
        text: 'Alamat email wajib diisi.',
        icon: 'warning',
      }),
    );
  });

  it('successfully sends reset request, clears form, and navigates after delay', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mockForgotPassword.mockResolvedValue({});

    setup();

    const emailInput = screen.getByTestId('email-input');
    const submitBtn = screen.getByTestId('send-instructions-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Permintaan Terkirim!',
        icon: 'success',
      }),
    );

    expect(emailInput.value).toBe('');
    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Email tidak ditemukan';
    mockForgotPassword.mockRejectedValue(new Error(errorMessage));

    setup();

    const emailInput = screen.getByTestId('email-input');
    const submitBtn = screen.getByTestId('send-instructions-button');

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalled();
    });

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Oops... Terjadi Kesalahan',
        text: errorMessage,
        icon: 'error',
      }),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles generic API errors', async () => {
    mockForgotPassword.mockRejectedValue({});

    setup();
    const submitBtn = screen.getByTestId('send-instructions-button');
    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: 'valid@test.com' },
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Oops... Terjadi Kesalahan',
          text: 'Gagal mengirim permintaan reset password.',
          icon: 'error',
        }),
      );
    });
  });

  it('disables input and button when loading', () => {
    useForgotPasswordMutation.mockReturnValue({
      mutateAsync: mockForgotPassword,
      isPending: true,
    });

    setup();

    const emailInput = screen.getByTestId('email-input');
    const submitBtn = screen.getByTestId('send-instructions-button');

    expect(emailInput).toBeDisabled();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent('Mengirim Permintaan...');
  });
});
