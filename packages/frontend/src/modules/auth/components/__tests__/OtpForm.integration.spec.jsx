import React from 'react';
import { render, screen, fireEvent, waitFor, act, configure } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OtpForm from '../OtpForm';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../hooks/useAuthMutations.js';

configure({ testIdAttribute: 'data-cy' });

const { mockNavigate, mockVerifyOtp, mockResendOtp, mockToast } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockVerifyOtp: vi.fn(),
  mockResendOtp: vi.fn(),
  mockToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: mockToast,
}));

vi.mock('../../hooks/useAuthMutations.js', () => ({
  useVerifyOtpMutation: vi.fn(),
  useResendOtpMutation: vi.fn(),
}));

describe('OtpForm Integration Tests', () => {
  const email = 'test@example.com';

  const renderComponent = () => {
    return render(<OtpForm email={email} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useVerifyOtpMutation.mockReturnValue({
      mutateAsync: mockVerifyOtp,
      isPending: false,
    });

    useResendOtpMutation.mockReturnValue({
      mutateAsync: mockResendOtp,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with initial state', () => {
    renderComponent();

    expect(screen.getByText(/Masukkan OTP/i)).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();

    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`otp-input-${i}`)).toBeInTheDocument();
      expect(screen.getByTestId(`otp-input-${i}`)).toHaveValue('');
    }

    expect(screen.getByTestId('verify-button')).toBeDisabled();
    expect(screen.getByTestId('otp-timer')).toBeInTheDocument();
    expect(screen.queryByTestId('resend-button')).not.toBeInTheDocument();
  });

  it('handles input changes: allows numbers and updates focus', () => {
    renderComponent();

    const input0 = screen.getByTestId('otp-input-0');
    const input1 = screen.getByTestId('otp-input-1');

    fireEvent.change(input0, { target: { value: '5' } });
    expect(input0).toHaveValue('5');

    fireEvent.change(input1, { target: { value: 'a' } });
    expect(input1).toHaveValue('');
  });

  it('handles backspace key logic', async () => {
    renderComponent();

    const input0 = screen.getByTestId('otp-input-0');
    const input1 = screen.getByTestId('otp-input-1');

    fireEvent.change(input0, { target: { value: '1' } });
    fireEvent.change(input1, { target: { value: '2' } });

    await waitFor(() => {
      expect(input1).toHaveValue('2');
    });

    fireEvent.keyDown(input1, { key: 'Backspace' });
    expect(input1).toHaveValue('');
  });

  it('handles successful OTP verification flow', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mockVerifyOtp.mockResolvedValue({
      data: { user: { id: 1 }, token: 'abc-token' },
    });

    renderComponent();

    const otpCode = '123456';
    otpCode.split('').forEach((char, index) => {
      fireEvent.change(screen.getByTestId(`otp-input-${index}`), {
        target: { value: char },
      });
    });

    const verifyBtn = screen.getByTestId('verify-button');
    expect(verifyBtn).not.toBeDisabled();

    fireEvent.click(verifyBtn);

    expect(screen.getByText('Memverifikasi...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({ email, otpCode });
    });

    expect(mockToast.success).toHaveBeenCalledWith('Verifikasi OTP berhasil!', expect.anything());

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles failed OTP verification', async () => {
    mockVerifyOtp.mockRejectedValue(new Error('Invalid OTP'));

    renderComponent();

    '123456'.split('').forEach((char, index) => {
      fireEvent.change(screen.getByTestId(`otp-input-${index}`), {
        target: { value: char },
      });
    });

    fireEvent.click(screen.getByTestId('verify-button'));

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalled();
    });

    expect(mockToast.error).toHaveBeenCalledWith('Invalid OTP', expect.anything());
    expect(screen.getByTestId('verify-button')).not.toBeDisabled();
  });

  it('handles Timer countdown and Resend flow', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockResendOtp.mockResolvedValue({ message: 'Resent successfully' });

    renderComponent();

    expect(screen.getByTestId('otp-timer')).toBeInTheDocument();
    expect(screen.queryByTestId('resend-button')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(120000);
    });

    await waitFor(() => {
      expect(screen.getByTestId('resend-button')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('otp-timer')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('resend-button'));

    expect(screen.getByText('Mengirim...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockResendOtp).toHaveBeenCalledWith(email);
    });

    expect(mockToast.success).toHaveBeenCalledWith('Resent successfully', expect.anything());

    expect(screen.getByTestId('otp-timer')).toBeInTheDocument();
    expect(screen.getByTestId('otp-input-0')).toHaveValue('');
  });

  it('handles Resend failure', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockResendOtp.mockRejectedValue(new Error('Network Error'));

    renderComponent();

    await act(async () => {
      vi.advanceTimersByTime(120000);
    });

    const resendBtn = await screen.findByTestId('resend-button');
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Network Error', expect.anything());
    });

    expect(screen.getByTestId('resend-button')).toBeInTheDocument();
  });

  it('prevents submission if OTP length is invalid (defensive check)', async () => {
    renderComponent();

    '12345'.split('').forEach((char, index) => {
      fireEvent.change(screen.getByTestId(`otp-input-${index}`), {
        target: { value: char },
      });
    });

    const verifyBtn = screen.getByTestId('verify-button');
    expect(verifyBtn).toBeDisabled();

    fireEvent.click(verifyBtn);
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });
});
