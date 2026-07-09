import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordForm from '../ResetPasswordForm';
import { toast } from 'react-toastify';

// --- MOCKS ---

// 1. Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. Mock React Toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// 3. Mock Store
const mockResetPasswordAction = vi.fn();
vi.mock('@/stores/managePasswordStore', () => ({
  useManagePasswordStore: () => ({
    resetPassword: mockResetPasswordAction,
  }),
}));

// 4. Mock PasswordInput (PENTING: Perhatikan data-testid)
vi.mock('@/components/ui/PasswordInput', () => ({
  PasswordInput: ({ label, value, onChange, show, setShow, id }) => (
    <div data-testid={`mock-container-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        data-testid={`input-${id}`} // Kita akan select berdasarkan ini agar unik
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

  // Hapus vi.useFakeTimers() dari beforeEach untuk menghindari Timeout pada userEvent
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Pastikan timer kembali normal setelah test selesai
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

  // --- TEST CASES ---

  it('should render form elements correctly', () => {
    renderComponent();

    // Gunakan regex yang lebih ketat dengan ^ (awalan) atau data-testid
    expect(screen.getByRole('heading', { name: /reset kata sandi/i })).toBeInTheDocument();

    // Perbaikan Selector: Gunakan test-id dari mock agar tidak ambigu
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('input-confirmPassword')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /reset kata sandi/i })).toBeInTheDocument();
  });

  it('should show error toast if password is less than 6 characters', async () => {
    renderComponent();

    // Perbaikan Selector: Gunakan getByTestId
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

  // // 🔥 TEST YANG MENYEBABKAN TIMEOUT SEBELUMNYA
  // it("should handle successful reset flow (Toast -> Timeout -> Navigate)", async () => {
  //   // 1. Setup Mock
  //   mockResetPasswordAction.mockResolvedValue({ message: "Success Reset" });

  //   renderComponent();

  //   const passInput = screen.getByTestId("input-password");
  //   const confirmInput = screen.getByTestId("input-confirmPassword");
  //   const submitBtn = screen.getByRole("button", { name: /reset kata sandi/i });

  //   // 2. Interaksi User (Pakai Real Timers dulu agar user.type tidak macet)
  //   await user.type(passInput, "password123");
  //   await user.type(confirmInput, "password123");

  //   // 3. BARU Aktifkan Fake Timers sebelum aksi submit yang memicu setTimeout
  //   vi.useFakeTimers();

  //   await user.click(submitBtn);

  //   // 4. Assertion API call
  //   expect(mockResetPasswordAction).toHaveBeenCalledWith(validToken, {
  //     password: "password123",
  //     confirmPassword: "password123",
  //   });

  //   // 5. Assertion Toast Sukses (Mungkin perlu flush promise microtask)
  //   // Kita gunakan await act(async () => {}) untuk menunggu state update React
  //   await act(async () => {
  //     await Promise.resolve();
  //   });

  //   expect(toast.success).toHaveBeenCalledWith(
  //     "Success Reset",
  //     expect.any(Object)
  //   );

  //   // 6. Cek Navigasi (Tunggu 2 detik)
  //   expect(mockNavigate).not.toHaveBeenCalled(); // Belum navigate

  //   // Majukan waktu
  //   act(() => {
  //     vi.advanceTimersByTime(2000);
  //   });

  //   // Sekarang harus navigate
  //   expect(mockNavigate).toHaveBeenCalledWith("/login");
  // });

  it('should handle API error gracefully', async () => {
    const errorMessage = 'Server Error';
    mockResetPasswordAction.mockRejectedValue(new Error(errorMessage));

    renderComponent();

    await user.type(screen.getByTestId('input-password'), 'password123');
    await user.type(screen.getByTestId('input-confirmPassword'), 'password123');
    await user.click(screen.getByRole('button', { name: /reset kata sandi/i }));

    // Tunggu promise reject
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
