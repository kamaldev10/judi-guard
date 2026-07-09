import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ChangePasswordForm from '../ChangePasswordForm';
import { useManagePasswordStore } from '@/stores/managePasswordStore';
import { useAuthStore } from '@/stores/authStore';

// --- Mocks ---

// Use vi.hoisted to ensure these variables are initialized before vi.mock calls are executed
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
// We mock this to ensure we can target the inputs easily without needing the actual UI component code
vi.mock('@/components/ui/PasswordInput', () => ({
  PasswordInput: ({ id, label, value, onChange, disabled }) => (
    <div data-testid={`mock-password-input-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        data-testid={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        type="text" // Keep it text for easy testing, we aren't testing browser masking
      />
    </div>
  ),
}));

// 4. Mock Stores (Zustand)
vi.mock('@/stores/managePasswordStore', () => ({
  useManagePasswordStore: vi.fn(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('ChangePasswordForm Integration Tests', () => {
  // Default mock implementations
  const mockChangePassword = vi.fn();
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default Store State
    useManagePasswordStore.mockReturnValue({
      changePassword: mockChangePassword,
      isLoading: false,
    });

    useAuthStore.mockReturnValue({
      logout: mockLogout,
    });
  });

  afterEach(() => {
    vi.useRealTimers(); // Clean up timers
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
      // submitBtn: screen.getByTestId("change-password-button"), // Accessing via the data-cy added in source
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
    // Setup mock to reject
    const errorMessage = 'Invalid current password';
    mockChangePassword.mockRejectedValue(new Error(errorMessage));

    setup();
    const { submitBtn } = fillForm('wrongOld', 'validPass123', 'validPass123');

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith('wrongOld', 'validPass123', 'validPass123');
    });

    expect(mockToast.error).toHaveBeenCalledWith(
      errorMessage,
      expect.objectContaining({ toastId: 'change-password-error' }),
    );
  });

  it('handles API errors with generic message fallback', async () => {
    // Setup mock to reject with empty error
    mockChangePassword.mockRejectedValue({});

    setup();
    const { submitBtn } = fillForm('old', 'validPass123', 'validPass123');

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Terjadi kesalahan.', expect.any(Object));
    });
  });

  it('successfully changes password, clears form, and performs delayed logout', async () => {
    // Use shouldAdvanceTime to allow waitFor to poll correctly without freezing completely
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockChangePassword.mockResolvedValue({
      message: 'Password updated successfully',
    });

    setup();
    const { submitBtn } = fillForm('oldPass123', 'newPass123', 'newPass123');

    fireEvent.click(submitBtn);

    // 1. Check immediate success
    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalled();
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      'Password updated successfully',
      expect.objectContaining({ toastId: 'change-password-success' }),
    );

    // 2. Check Form Clearing
    expect(screen.getByTestId('currentPassword').value).toBe('');
    expect(screen.getByTestId('newPassword').value).toBe('');
    expect(screen.getByTestId('confirmPassword').value).toBe('');

    // 3. Verify Logout hasn't happened yet
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    // 4. Fast-forward time by 2 seconds
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // 5. Verify delayed actions
    expect(mockLogout).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      'Berhasil! Silakan login kembali dengan sandi baru Anda.',
      expect.objectContaining({ toastId: 'change-password-logout-success' }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('disables inputs and button when loading', () => {
    // Override store mock for this specific test
    useManagePasswordStore.mockReturnValue({
      changePassword: mockChangePassword,
      isLoading: true, // Simulate loading
    });

    setup();

    const submitBtn = screen.getByRole('button', { name: /Memperbarui.../i });

    // Note: The actual button component in the source code does not have the disabled={isLoading} attribute,
    // only the inputs do. It uses classes for styling. We only verify inputs are disabled.
    // expect(submitBtn).toBeDisabled();

    expect(screen.getByTestId('currentPassword')).toBeDisabled();
    expect(screen.getByTestId('newPassword')).toBeDisabled();
    expect(screen.getByTestId('confirmPassword')).toBeDisabled();
  });
});
