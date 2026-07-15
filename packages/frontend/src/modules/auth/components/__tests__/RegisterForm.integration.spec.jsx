import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import { toast } from 'react-toastify';
import { useRegisterMutation } from '../../hooks/useAuthMutations.js';
import {
  validateUserName,
  validateEmail,
  validateRegistrationPassword,
} from '@/shared/utils/formValidators.js';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
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

const mockRegister = vi.fn();
vi.mock('../../hooks/useAuthMutations.js', () => ({
  useRegisterMutation: vi.fn(),
}));

vi.mock('@/shared/utils/formValidators.js', () => ({
  validateUserName: vi.fn(() => ''),
  validateEmail: vi.fn(() => ''),
  validateRegistrationPassword: vi.fn(() => ''),
}));

vi.mock('../GoogleSignInButton.jsx', () => ({
  default: ({ disabled }) => (
    <button data-testid="mock-google-button" disabled={disabled}>
      Mock Google Register
    </button>
  ),
}));

vi.mock('lucide-react', () => ({
  Eye: (props) => <svg data-testid="eye-icon" aria-label="Show Password" {...props} />,
  EyeOff: (props) => <svg data-testid="eye-off-icon" aria-label="Hide Password" {...props} />,
}));

describe('Register Form Integration Testing', () => {
  const user = userEvent.setup();

  const renderForm = () => {
    return render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    validateUserName.mockReturnValue('');
    validateEmail.mockReturnValue('');
    validateRegistrationPassword.mockReturnValue('');

    useRegisterMutation.mockReturnValue({
      mutateAsync: mockRegister,
      isPending: false,
    });
  });

  it('should render the form correctly with initial state', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: /daftar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeEnabled();
    expect(screen.getByLabelText(/email/i)).toBeEnabled();
    expect(screen.getByLabelText(/^password$/i)).toBeEnabled();

    expect(screen.getByTestId('mock-google-button')).toBeInTheDocument();
    expect(screen.getByTestId('mock-google-button')).toBeEnabled();
  });

  it('should update values and show/hide inline errors on change', async () => {
    const userError = 'Username terlalu pendek';

    validateUserName.mockImplementation((val) => {
      if (val === 'ok!') return userError;
      return '';
    });

    renderForm();
    const userInput = screen.getByLabelText(/username/i);

    await user.type(userInput, 'ok');
    expect(userInput).toHaveValue('ok');
    expect(screen.queryByText(userError)).not.toBeInTheDocument();

    await user.type(userInput, '!');
    expect(userInput).toHaveValue('ok!');
    expect(screen.getByText(userError)).toBeInTheDocument();
  });

  it('should toggle password visibility on eye icon click', async () => {
    renderForm();
    const passwordInput = screen.getByLabelText(/^password$/i);
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show validation errors on submit and not call register', async () => {
    const userError = 'Username diperlukan';
    const emailError = 'Email tidak valid';
    const passwordError = 'Password min 8 karakter';

    validateUserName.mockReturnValue(userError);
    validateEmail.mockReturnValue(emailError);
    validateRegistrationPassword.mockReturnValue(passwordError);

    renderForm();
    const submitButton = screen.getByRole('button', { name: /daftar/i });

    await user.click(submitButton);

    expect(screen.getByText(userError)).toBeInTheDocument();
    expect(screen.getByText(emailError)).toBeInTheDocument();
    expect(screen.getByText(passwordError)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('should handle successful registration and navigate to OTP page', async () => {
    mockRegister.mockResolvedValueOnce(undefined);

    renderForm();
    const userInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /daftar/i });

    const testUser = 'penggunaBaru';
    const testEmail = 'baru@example.com';
    const testPassword = 'passwordValid123';

    await user.type(userInput, testUser);
    await user.type(emailInput, testEmail);
    await user.type(passwordInput, testPassword);

    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalledWith({
      userName: testUser,
      email: testEmail,
      password: testPassword,
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/otp', {
        state: { email: testEmail },
      });
    });
  });

  it('should show error toast if register action fails', async () => {
    const errorMessage = 'Email sudah terdaftar';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));

    renderForm();
    const submitButton = screen.getByRole('button', { name: /daftar/i });

    await user.type(screen.getByLabelText(/username/i), 'user');
    await user.type(screen.getByLabelText(/email/i), 'mail@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'pass123');

    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalled();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
