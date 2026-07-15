import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChangePasswordForm from '../ChangePasswordForm';
import { useChangePasswordMutation } from '../hooks/useAuthMutations.js';
import { useAuthUiStore } from '@/modules/auth';

// --- Mocks ---

const { mockNavigate, mockToast } = vi.hoisted(() => {
  return {
    mockNavigate: vi.fn(),
    mockToast: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

// 1. Mock React Router Dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// 2. Mock React Toastify
vi.mock('react-toastify', () => ({
  toast: mockToast,
}));

// 3. Mock Custom UI Component (PasswordInput)
vi.mock('@/shared/components/ui/PasswordInput', () => ({
  PasswordInput: ({ id, label, value, onChange, disabled }) => (
    <div data-testid={`mock-password-input-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        data-testid={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        type="text"
      />
    </div>
  ),
}));

// 4. Mock Hooks & Stores
vi.mock('../hooks/useAuthMutations.js', () => ({
  useChangePasswordMutation: vi.fn(),
}));

vi.mock('@/modules/auth', () => ({
  useAuthUiStore: vi.fn(),
}));

describe('ChangePasswordForm Integration Tests', () => {
  const mockChangePassword = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Hook & Store State
    useChangePasswordMutation.mockReturnValue({
      mutateAsync: mockChangePassword,
      isPending: false,
    });

    useAuthUiStore.mockReturnValue(mockLogout);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setup = () => {
    return render(<ChangePasswordForm />);
  };

  const fillForm = (current, newPass, confirmPass) => {
    const currentInput = screen.getByTestId('currentPassword');
    const newInput = screen.getByTestId('newPassword');
    const confirmInput = screen.getByTestId('confirmPassword');

    fireEvent.change(currentInput, { target: { value: current } });
    fireEvent.change(newInput, { target: { value: newPass } });
    fireEvent.change(confirmInput, { target: { value: confirmPass } });

    return {
      submitBtn: screen.getByRole('button', { name: /ubah kata sandi/i }),
    };
  };

  it('renders the form fields correctly', () => {
    setup();
    expect(screen.getByLabelText(/Kata Sandi Saat Ini/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Kata Sandi Baru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Konfirmasi Kata Sandi Baru/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ubah Kata Sandi/i })).toBeInTheDocument();
  });

  it('shows error validation if new password is less than 8 characters', async () => {
    setup();
    const { submitBtn } = fillForm('oldPass123', 'short', 'short');

    fireEvent.click(submitBtn);

    expect(mockChangePassword).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledWith(
      'Kata sandi baru harus minimal 8 karakter.',
      expect.objectContaining({ position: 'bottom-right' }),
    );
  });

  it('shows error validation if passwords do not match', async () => {
    setup();
    const { submitBtn } = fillForm('oldPass123', 'newPass123', 'differentPass123');

    fireEvent.click(submitBtn);

    expect(mockChangePassword).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledWith(
      'Kata sandi baru dan konfirmasi kata sandi tidak cocok.',
      expect.objectContaining({ position: 'bottom-right' }),
    );
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Invalid current password';
    mockChangePassword.mockRejectedValue(new Error(errorMessage));

    setup();
    const { submitBtn } = fillForm('wrongOld', 'validPass123', 'validPass123');

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith({
        currentPassword: 'wrongOld',
        newPassword: 'validPass123',
        confirmPassword: 'validPass123',
      });
    });

    expect(mockToast.error).toHaveBeenCalledWith(
      errorMessage,
      expect.objectContaining({ toastId: 'change-password-error' }),
    );
  });

  it('handles API errors with generic message fallback', async () => {
    mockChangePassword.mockRejectedValue({});

    setup();
    const { submitBtn } = fillForm('old', 'validPass123', 'validPass123');

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Terjadi kesalahan.', expect.any(Object));
    });
  });

  it('successfully changes password, clears form, and performs delayed logout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockChangePassword.mockResolvedValue({
      message: 'Password updated successfully',
    });

    setup();
    const { submitBtn } = fillForm('oldPass123', 'newPass123', 'newPass123');

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalled();
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      'Password updated successfully',
      expect.objectContaining({ toastId: 'change-password-success' }),
    );

    expect(screen.getByTestId('currentPassword').value).toBe('');
    expect(screen.getByTestId('newPassword').value).toBe('');
    expect(screen.getByTestId('confirmPassword').value).toBe('');

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      'Berhasil! Silakan login kembali dengan sandi baru Anda.',
      expect.objectContaining({ toastId: 'change-password-logout-success' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('disables inputs and button when loading', () => {
    useChangePasswordMutation.mockReturnValue({
      mutateAsync: mockChangePassword,
      isPending: true,
    });

    setup();

    expect(screen.getByTestId('currentPassword')).toBeDisabled();
    expect(screen.getByTestId('newPassword')).toBeDisabled();
    expect(screen.getByTestId('confirmPassword')).toBeDisabled();
  });
});
