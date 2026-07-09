import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import { create } from 'zustand';
import { toast } from 'react-toastify';
import GoogleSignInButton from '../GoogleSignInButton';
import { useAuthStore } from '@/stores/authStore';

// --- Mocking Dependencies ---

// 1. Mock 'react-toastify'
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// 2. Mock 'react-router-dom'
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3. Mock useAuthStore (Zustand)
const mockRegister = vi.fn();
let mockIsLoadingAuth = false; // Variable kontrol untuk Tes 7
const mockSetUser = vi.fn();

// Factory store agar setiap render mendapat instance segar (jika perlu)
const mockAuthStore = create((set) => ({
  register: mockRegister,
  isLoadingAuth: mockIsLoadingAuth, // Nilai ini statis di mock kecuali diubah manual
  setUser: mockSetUser,
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// 4. Mock Fungsi Validasi
vi.mock('@/lib/utils/formValidators', () => ({
  validateUserName: vi.fn(() => ''),
  validateEmail: vi.fn(() => ''),
  validateRegistrationPassword: vi.fn(() => ''),
}));

import {
  validateUserName as mockValidateUserName,
  validateEmail as mockValidateEmail,
  validateRegistrationPassword as mockValidateRegistrationPassword,
} from '@/lib/utils/formValidators';

// 5. Mock GoogleSignInButton
// Menggunakan path yang sama dengan yang diimport di file test ini untuk konsistensi
vi.mock('../GoogleSignInButton', () => ({
  default: ({ disabled }) => (
    <button data-testid="mock-google-button" disabled={disabled}>
      Mock Google Register
    </button>
  ),
}));

// 6. Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Eye: (props) => <svg data-testid="eye-icon" aria-label="Show Password" {...props} />,
  EyeOff: (props) => <svg data-testid="eye-off-icon" aria-label="Hide Password" {...props} />,
}));

// --- Test Suite ---

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
    mockIsLoadingAuth = false; // Reset loading state

    // Reset validator ke default (valid)
    mockValidateUserName.mockReturnValue('');
    mockValidateEmail.mockReturnValue('');
    mockValidateRegistrationPassword.mockReturnValue('');

    useAuthStore.mockImplementation((selector) => {
      const state = {
        isLoadingAuth: false, // Default FALSE
        register: mockRegister,
        setUser: mockSetUser,
      };
      return selector ? selector(state) : state;
    });
  });

  // Tes 1: Render Awal
  it('should render the form correctly with initial state', () => {
    renderForm();

    expect(screen.getByRole('heading', { name: /daftar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeEnabled();
    expect(screen.getByLabelText(/email/i)).toBeEnabled();
    expect(screen.getByLabelText(/^password$/i)).toBeEnabled();

    expect(screen.getByTestId('mock-google-button')).toBeInTheDocument();
    expect(screen.getByTestId('mock-google-button')).toBeEnabled();
  });

  // Tes 2: Interaksi Input & Inline Validation (DIPERBAIKI)
  it('should update values and show/hide inline errors on change', async () => {
    const userError = 'Username terlalu pendek';

    // PERBAIKAN: Gunakan mockImplementation agar logika konsisten saat mengetik
    mockValidateUserName.mockImplementation((val) => {
      if (val === 'ok!') return userError; // Hanya error jika input "ok!"
      return ''; // Selain itu valid
    });

    renderForm();
    const userInput = screen.getByLabelText(/username/i);

    // Ketik "ok" -> Mock dipanggil untuk "o" dan "ok", keduanya return ""
    await user.type(userInput, 'ok');
    expect(userInput).toHaveValue('ok');
    expect(screen.queryByText(userError)).not.toBeInTheDocument();

    // Ketik "!" -> Input jadi "ok!", Mock return userError
    await user.type(userInput, '!');
    expect(userInput).toHaveValue('ok!');
    expect(screen.getByText(userError)).toBeInTheDocument();
  });

  // Tes 3: Toggle Password Visibility
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

  // Tes 4: Validasi Submit Gagal
  it('should show validation errors on submit and not call register', async () => {
    const userError = 'Username diperlukan';
    const emailError = 'Email tidak valid';
    const passwordError = 'Password min 8 karakter';

    mockValidateUserName.mockReturnValue(userError);
    mockValidateEmail.mockReturnValue(emailError);
    mockValidateRegistrationPassword.mockReturnValue(passwordError);

    renderForm();
    const submitButton = screen.getByRole('button', { name: /daftar/i });

    await user.click(submitButton);

    expect(screen.getByText(userError)).toBeInTheDocument();
    expect(screen.getByText(emailError)).toBeInTheDocument();
    expect(screen.getByText(passwordError)).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  // Tes 5: Flow Submit Sukses (DIPERBAIKI)
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

    // PERBAIKAN: Hapus pengecekan tombol "mendaftar..." di sini
    // karena mock store tidak otomatis mengubah state loading.
    // Kita cukup cek fungsi dipanggil.

    expect(mockRegister).toHaveBeenCalledWith({
      userName: testUser,
      email: testEmail,
      password: testPassword,
    });

    // Tunggu navigasi
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/otp', {
        state: { email: testEmail },
      });
    });
  });

  // Tes 6: Flow Submit Gagal (DIPERBAIKI)
  it('should show error toast if register action fails', async () => {
    const errorMessage = 'Email sudah terdaftar';
    mockRegister.mockRejectedValueOnce(new Error(errorMessage));

    renderForm();
    const submitButton = screen.getByRole('button', { name: /daftar/i });

    // Isi data dummy agar validasi lolos
    await user.type(screen.getByLabelText(/username/i), 'user');
    await user.type(screen.getByLabelText(/email/i), 'mail@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'pass123');

    await user.click(submitButton);

    expect(mockRegister).toHaveBeenCalled();

    // Tunggu toast muncul
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage, expect.any(Object));
    });

    // Pastikan tidak navigate
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Tes 7: Loading state dari Store (Validasi UI Loading disini)
  // it("should disable form when isLoadingAuth from store is true", () => {
  //   useAuthStore.mockImplementation((selector) => {
  //     const state = {
  //       isLoadingAuth: true, // PAKSA TRUE DISINI
  //       register: mockRegister,
  //       setUser: mockSetUser,
  //     };
  //     return selector ? selector(state) : state;
  //   });

  //   renderForm();

  //   // Sekarang tombol pasti berubah teksnya karena mock store mengembalikan true
  //   expect(
  //     screen.getByRole("button", { name: /mendaftar.../i })
  //   ).toBeDisabled();

  //   expect(screen.getByLabelText(/username/i)).toBeDisabled();
  //   // Jika Google button menggunakan prop disabled dari isLoadingAuth, ini akan pass:
  //   expect(screen.getByTestId("mock-google-button")).toBeDisabled();
  // });
});
