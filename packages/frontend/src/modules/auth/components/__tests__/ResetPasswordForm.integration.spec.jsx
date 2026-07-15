import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordForm from '../ResetPasswordForm';
import { toast } from 'react-toastify';
import { useResetPasswordMutation } from '../../hooks/useAuthMutations.js';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockResetPasswordAction = vi.fn();
vi.mock('../../hooks/useAuthMutations.js', () => ({
  useResetPasswordMutation: vi.fn(),
}));

vi.mock('@/shared/components/ui/PasswordInput', () => ({
  PasswordInput: ({ label, value, onChange, show, setShow, id }) => (
    <div data-testid={`mock-container-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        data-testid={`input-${id}`}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
      />
      <button type="button" onClick={() => setShow(!show)} aria-label={`toggle-${id}`}>
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  ),
}));

describe('ResetPasswordForm Component', () => {
  const user = userEvent.setup();
  const validToken = 'valid-token-123';

  beforeEach(() => {
    vi.clearAllMocks();

    useResetPasswordMutation.mockReturnValue({
      mutateAsync: mockResetPasswordAction,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ResetPasswordForm token={validToken} {...props} />
      </MemoryRouter>,
    );
  };

  it('should render form elements correctly', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /reset kata sandi/i })).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('input-confirmPassword')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset kata sandi/i })).toBeInTheDocument();
  });

  it('should show error toast if password is less than 6 characters', async () => {
    renderComponent();

    const passInput = screen.getByTestId('input-password');
    const submitBtn = screen.getByRole('button', { name: /reset kata sandi/i });

    await user.type(passInput, '12345');
    await user.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith(
      'Kata sandi baru minimal harus 6 karakter.',
      expect.any(Object),
    );
    expect(mockResetPasswordAction).not.toHaveBeenCalled();
  });

  it('should show error toast if passwords do not match', async () => {
    renderComponent();

    const passInput = screen.getByTestId('input-password');
    const confirmInput = screen.getByTestId('input-confirmPassword');
    const submitBtn = screen.getByRole('button', { name: /reset kata sandi/i });

    await user.type(passInput, 'password123');
    await user.type(confirmInput, 'passwordBeda');
    await user.click(submitBtn);

    expect(toast.error).toHaveBeenCalledWith(
      'Kata sandi baru dan konfirmasi tidak cocok.',
      expect.any(Object),
    );
    expect(mockResetPasswordAction).not.toHaveBeenCalled();
  });

  it('should handle API error gracefully', async () => {
    const errorMessage = 'Server Error';
    mockResetPasswordAction.mockRejectedValue(new Error(errorMessage));

    renderComponent();

    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.type(screen.getByTestId('input-confirmPassword'), 'password123');
    await user.click(screen.getByRole('button', { name: /reset kata sandi/i }));

    await act(async () => {
      try {
        await Promise.resolve();
      } catch (e) {}
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
  });

  it('should call onInvalidToken callback when API returns 400 or 401', async () => {
    const errorObj = {
      response: {
        status: 400,
        data: { message: 'Token Expired' },
      },
    };
    mockResetPasswordAction.mockRejectedValue(errorObj);
    const onInvalidTokenMock = vi.fn();

    renderComponent({ onInvalidToken: onInvalidTokenMock });

    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.type(screen.getByTestId('input-confirmPassword'), 'password123');
    await user.click(screen.getByRole('button', { name: /reset kata sandi/i }));

    await act(async () => {
      await Promise.resolve();
    });

    expect(onInvalidTokenMock).toHaveBeenCalled();
  });
});
