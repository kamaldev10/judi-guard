import React from 'react';
import { render, screen, fireEvent, waitFor, act, configure } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { useLoginMutation } from '../../hooks/useAuthMutations.js';
import { useAuthUiStore } from '@/modules/auth';
import { validateEmail, validateLoginPassword } from '@/shared/utils/formValidators.js';

configure({ testIdAttribute: 'data-cy' });

const { mockNavigate, mockLogin, mockSetUser, mockToast, mockValidateEmail, mockValidatePassword } =
  vi.hoisted(() => ({
    mockNavigate: vi.fn(),
    mockLogin: vi.fn(),
    mockSetUser: vi.fn(),
    mockToast: { success: vi.fn(), error: vi.fn() },
    mockValidateEmail: vi.fn(),
    mockValidatePassword: vi.fn(),
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
  useLoginMutation: vi.fn(),
}));

vi.mock('@/modules/auth', () => ({
  useAuthUiStore: vi.fn(),
}));

vi.mock('@/shared/utils/formValidators.js', () => ({
  validateEmail: mockValidateEmail,
  validateLoginPassword: mockValidatePassword,
}));

vi.mock('../GoogleSignInButton.jsx', () => ({
  default: ({ buttonText, disabled }) => (
    <button data-cy="google-signin-btn" disabled={disabled}>
      {buttonText}
    </button>
  ),
}));

describe('LoginForm Integration Tests', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockValidateEmail.mockReturnValue('');
    mockValidatePassword.mockReturnValue('');

    useLoginMutation.mockReturnValue({
      mutateAsync: mockLogin,
      isPending: false,
    });

    useAuthUiStore.mockReturnValue(mockSetUser);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders all form elements correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /Masuk/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('log-in-button')).toBeInTheDocument();
    expect(screen.getByTestId('google-signin-btn')).toBeInTheDocument();
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument();
    expect(screen.getByText(/Belum punya akun\?/i)).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderComponent();

    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', {
      name: /Hide Password|Show Password/i,
    });

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('updates input values and triggers validation on change', () => {
    renderComponent();

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, {
      target: { value: 'test@email.com', name: 'email' },
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password123', name: 'password' },
    });

    expect(emailInput.value).toBe('test@email.com');
    expect(passwordInput.value).toBe('password123');

    expect(mockValidateEmail).toHaveBeenCalledWith('test@email.com');
    expect(mockValidatePassword).toHaveBeenCalledWith('password123');
  });

  it('blocks submission and shows errors if validation fails', () => {
    mockValidateEmail.mockReturnValue('Email tidak valid');
    mockValidatePassword.mockReturnValue('Password terlalu pendek');

    renderComponent();

    const submitBtn = screen.getByTestId('log-in-button');
    fireEvent.click(submitBtn);

    expect(mockValidateEmail).toHaveBeenCalled();
    expect(mockValidatePassword).toHaveBeenCalled();

    expect(screen.getByText('Email tidak valid')).toBeInTheDocument();
    expect(screen.getByText('Password terlalu pendek')).toBeInTheDocument();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('handles successful login and navigation', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const mockUser = { id: 1, name: 'Test User' };
    mockLogin.mockResolvedValue({ data: { user: mockUser } });

    renderComponent();

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { name: 'email', value: 'valid@email.com' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { name: 'password', value: 'ValidPass123' },
    });

    fireEvent.submit(screen.getByTestId('log-in-button').closest('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'valid@email.com',
        password: 'ValidPass123',
      });
    });

    expect(mockSetUser).toHaveBeenCalledWith(mockUser);
    expect(mockToast.success).toHaveBeenCalledWith('Anda berhasil login!', expect.anything());

    await act(async () => {
      vi.runAllTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('handles login failure (API Error)', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid Credentials'));

    renderComponent();

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { name: 'email', value: 'wrong@email.com' },
    });
    fireEvent.change(screen.getByTestId('password-input'), {
      target: { name: 'password', value: 'WrongPass' },
    });

    fireEvent.click(screen.getByTestId('log-in-button'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockToast.error).toHaveBeenCalledWith('Error: Invalid Credentials', expect.anything());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables inputs and buttons when loading', () => {
    useLoginMutation.mockReturnValue({
      mutateAsync: mockLogin,
      isPending: true,
    });

    renderComponent();

    expect(screen.getByTestId('email-input')).toBeDisabled();
    expect(screen.getByTestId('password-input')).toBeDisabled();
    expect(screen.getByTestId('log-in-button')).toBeDisabled();
    expect(screen.getByTestId('log-in-button')).toHaveTextContent('Memproses...');
    expect(screen.getByTestId('google-signin-btn')).toBeDisabled();
  });
});
