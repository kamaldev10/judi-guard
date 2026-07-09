import React from 'react';
import { render, screen, fireEvent, waitFor, act, configure } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OtpForm from '../OtpForm';

// --- Configuration ---
configure({ testIdAttribute: 'data-cy' });

// --- Mocks ---

// 1. Hoisted variables
const { mockNavigate, mockLogin, mockVerifyOtp, mockResendOtp, mockToast, mockUseAuthStore } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockLogin: vi.fn(),
    mockVerifyOtp: vi.fn(),
    mockResendOtp: vi.fn(),
    mockToast: { success: vi.fn(), error: vi.fn() },
    mockUseAuthStore: vi.fn(),
  }));

// 2. Mock React Router Dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3. Mock Toastify
vi.mock('react-toastify', () => ({
  toast: mockToast,
}));

// 4. Mock Auth Store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector) => mockUseAuthStore(selector),
}));

describe('OtpForm Integration Tests', () => {
  const email = 'test@example.com';

  const renderComponent = () => {
    return render(<OtpForm email={email} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Store Implementation
    mockUseAuthStore.mockImplementation((selector) => {
      const state = {
        login: mockLogin,
        verifyOtp: mockVerifyOtp,
        resendOtp: mockResendOtp,
      };
      return selector ? selector(state) : state;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with initial state', () => {
    renderComponent();

    expect(screen.getByText(/Masukkan OTP/i)).toBeInTheDocument();
    expect(screen.getByText(email)).toBeInTheDocument();

    // Check 6 inputs exist
    for (let i = 0; i < 6; i++) {
      expect(screen.getByTestId(`otp-input-${i}`)).toBeInTheDocument();
      expect(screen.getByTestId(`otp-input-${i}`)).toHaveValue('');
    }

    // Check Verify button is disabled initially (empty inputs)
    expect(screen.getByTestId('verify-button')).toBeDisabled();

    // Check Timer is visible
    expect(screen.getByTestId('otp-timer')).toBeInTheDocument();
    expect(screen.queryByTestId('resend-button')).not.toBeInTheDocument();
  });

  it('handles input changes: allows numbers and updates focus', () => {
    renderComponent();

    const input0 = screen.getByTestId('otp-input-0');
    const input1 = screen.getByTestId('otp-input-1');

    // Type a number
    fireEvent.change(input0, { target: { value: '5' } });
    expect(input0).toHaveValue('5');

    // Type a non-number (should be ignored based on regex in component)
    fireEvent.change(input1, { target: { value: 'a' } });
    expect(input1).toHaveValue(''); // Should remain empty
  });

  it('handles backspace key logic', async () => {
    renderComponent();

    const input0 = screen.getByTestId('otp-input-0');
    const input1 = screen.getByTestId('otp-input-1');

    // Setup: Fill first two inputs
    fireEvent.change(input0, { target: { value: '1' } });
    fireEvent.change(input1, { target: { value: '2' } });

    // FIX 1: Wait for state update to ensure inputs are filled before backspace
    await waitFor(() => {
      expect(input1).toHaveValue('2');
    });

    // Focus input 1 and hit backspace (should clear it)
    fireEvent.keyDown(input1, { key: 'Backspace' });

    // Check if it clears
    expect(input1).toHaveValue('');
  });

  it('handles successful OTP verification flow', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const mockUser = { id: 1, name: 'User' };
    const mockToken = 'abc-token';

    mockVerifyOtp.mockResolvedValue({
      data: { user: mockUser, token: mockToken },
    });

    renderComponent();

    // Fill all inputs
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
      expect(mockVerifyOtp).toHaveBeenCalledWith(email, otpCode);
    });

    expect(mockLogin).toHaveBeenCalledWith(mockUser, mockToken);
    expect(mockToast.success).toHaveBeenCalledWith('Verifikasi OTP berhasil!', expect.anything());

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('handles failed OTP verification', async () => {
    mockVerifyOtp.mockRejectedValue(new Error('Invalid OTP'));

    renderComponent();

    // Fill all inputs
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
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId('verify-button')).not.toBeDisabled(); // Should return to normal
  });

  it('handles Timer countdown and Resend flow', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockResendOtp.mockResolvedValue({ message: 'Resent successfully' });

    renderComponent();

    expect(screen.getByTestId('otp-timer')).toBeInTheDocument();
    expect(screen.queryByTestId('resend-button')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(120000); // 120 seconds
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

    // Advance time to show resend button
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
