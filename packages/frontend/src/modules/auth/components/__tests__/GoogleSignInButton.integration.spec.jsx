import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import GoogleSignInButton from '../GoogleSignInButton';
import { toast } from 'react-toastify';
import { useGoogleSignInMutation } from '../hooks/useAuthMutations.js';

// --- Mocking Dependencies ---

// 1. Mock 'react-toastify'
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 2. Mock 'react-router-dom' (useNavigate)
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3. Mock useGoogleSignInMutation & useAuthStore
const mockGoogleSignIn = vi.fn();
vi.mock('../hooks/useAuthMutations.js', () => ({
  useGoogleSignInMutation: vi.fn(),
}));

vi.mock('@/modules/auth', () => ({
  useAuthUiStore: vi.fn(),
}));

// 4. Mock '@iconify/react'
vi.mock('@iconify/react', () => ({
  Icon: (props) => <span data-testid="google-icon" icon={props.icon}></span>,
}));

// 5. Mock '@react-oauth/google' (GoogleLogin)
let googleOnSuccessCallback = null;
let googleOnErrorCallback = null;
let googleRenderProps = {};

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError, render }) => {
    googleOnSuccessCallback = onSuccess;
    googleOnErrorCallback = onError;

    const mockOnClick = vi.fn();
    googleRenderProps = { onClick: mockOnClick, disabled: false };
    return render(googleRenderProps);
  },
}));

describe('Google Sign In Button Integration Testing', () => {
  const user = userEvent.setup();
  const mockOnErrorCustom = vi.fn();

  const renderButton = (props = {}) => {
    return render(
      <MemoryRouter>
        <GoogleSignInButton {...props} />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    googleOnSuccessCallback = null;
    googleOnErrorCallback = null;
    googleRenderProps = {};

    useGoogleSignInMutation.mockReturnValue({
      mutateAsync: mockGoogleSignIn,
      isPending: false,
    });
  });

  it('should render the button correctly', () => {
    const buttonText = 'Masuk via Google';
    renderButton({ buttonText });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(screen.getByTestId('google-icon')).toBeInTheDocument();
  });

  it('should render disabled when disabled prop is true', () => {
    renderButton({ disabled: true });
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should show error toast and call onErrorCustom on Google onError callback', async () => {
    renderButton({ onErrorCustom: mockOnErrorCustom });
    const button = screen.getByRole('button', { name: /masuk dengan google/i });

    await user.click(button);

    const mockError = { error: 'popup_closed_by_user' };
    await act(async () => {
      googleOnErrorCallback(mockError);
    });

    expect(toast.error).toHaveBeenCalledWith('Proses login Google dibatalkan.', expect.any(Object));
    expect(mockOnErrorCustom).toHaveBeenCalledTimes(1);
    expect(mockOnErrorCustom).toHaveBeenCalledWith(mockError);
    expect(mockGoogleSignIn).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error toast if Google onSuccess provides no credential', async () => {
    renderButton({ onErrorCustom: mockOnErrorCustom });
    const button = screen.getByRole('button', { name: /masuk dengan google/i });

    await user.click(button);

    const mockCredential = {};
    await act(async () => {
      googleOnSuccessCallback(mockCredential);
    });

    expect(toast.error).toHaveBeenCalledWith('Google ID Token tidak diterima', expect.any(Object));
    expect(mockOnErrorCustom).toHaveBeenCalledTimes(1);
    expect(mockOnErrorCustom).toHaveBeenCalledWith(expect.any(Error));
    expect(mockGoogleSignIn).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
