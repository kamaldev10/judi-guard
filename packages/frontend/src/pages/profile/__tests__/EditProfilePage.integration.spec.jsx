import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EditProfilePage from '../EditProfilePage';

import { useEditProfilePresenter } from '@/hooks/profile/useEditProfilePresenter';
import EditProfileForm from '@/components/profile/EditProfileForm';

// Mock 'framer-motion'
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
}));

// Mock 'lucide-react' icons
vi.mock('lucide-react', () => ({
  Loader2: (props) => <svg data-testid="loader-icon" {...props} />,
  AlertTriangle: (props) => <svg data-testid="alert-icon" {...props} />,
  ArrowLeft: (props) => <svg data-testid="arrow-left-icon" {...props} />,
}));

// Mock child component 'EditProfileForm'
vi.mock('@/components/profile/EditProfileForm', () => ({
  default: vi.fn(() => <div data-testid="mock-edit-form">Mock Edit Form</div>),
}));

// Mock custom hook 'useEditProfilePresenter'
vi.mock('@/hooks/profile/useEditProfilePresenter', () => ({
  useEditProfilePresenter: vi.fn(),
}));

/** @type {import('vitest').Mock<[], ReturnType<typeof useEditProfilePresenter>>} */
const mockedUseEditProfilePresenter = useEditProfilePresenter;
/** @type {import('vitest').Mock<[React.ComponentProps<typeof EditProfileForm>], JSX.Element>} */
const MockedEditProfileForm = EditProfileForm;

// --- Test Suite ---
describe('Edit Profile Page Integration Testing', () => {
  const user = userEvent.setup();

  // Siapkan handler tiruan untuk hook
  const mockHandleInputChange = vi.fn();
  const mockHandleSubmit = vi.fn();
  const mockHandleCancel = vi.fn();

  // Definisikan state default (sukses)
  const defaultHookState = {
    formData: { email: 'test@example.com', username: 'testuser' },
    isLoading: false,
    isSaving: false,
    fetchError: null,
    handleInputChange: mockHandleInputChange,
    handleSubmit: mockHandleSubmit,
    handleCancel: mockHandleCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Atur ulang hook ke state default (sukses) sebelum setiap tes
    mockedUseEditProfilePresenter.mockReturnValue(defaultHookState);
  });

  // Tes 1: State Sukses (Render Form)
  it('should render the EditProfileForm when loaded and no error', () => {
    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>,
    );

    // Verifikasi hook dipanggil
    expect(mockedUseEditProfilePresenter).toHaveBeenCalledTimes(1);

    // Verifikasi form (mock) di-render
    expect(screen.getByTestId('mock-edit-form')).toBeInTheDocument();

    // Verifikasi state lain (loading, error) tidak di-render
    expect(screen.queryByText(/memuat data profil/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // Verifikasi props diteruskan dengan benar ke form (mock)
    expect(MockedEditProfileForm).toHaveBeenCalledTimes(1);
    const expectedProps = expect.objectContaining({
      formData: defaultHookState.formData,
      isSaving: false,
      onSubmit: mockHandleSubmit,
      onInputChange: mockHandleInputChange,
      onCancel: mockHandleCancel,
    });

    // Periksa props (argumen pertama) secara manual
    expect(MockedEditProfileForm.mock.calls[0][0]).toEqual(expectedProps);
  });

  // Tes 2: State Loading Awal
  it('should render the loading spinner when isLoading is true', () => {
    // Override state hook untuk tes ini
    mockedUseEditProfilePresenter.mockReturnValue({
      ...defaultHookState,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>,
    );

    // Verifikasi spinner dan teks loading muncul
    expect(screen.getByText(/memuat data profil/i)).toBeInTheDocument();
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    // Verifikasi form dan error tidak muncul
    expect(screen.queryByTestId('mock-edit-form')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // Tes 3: State Error Awal
  it('should render the error message when fetchError is present', async () => {
    const mockError = new Error('Gagal mengambil data dari server');
    // Override state hook untuk tes ini
    mockedUseEditProfilePresenter.mockReturnValue({
      ...defaultHookState,
      isLoading: false,
      fetchError: mockError,
    });

    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>,
    );

    // Verifikasi UI error muncul
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /gagal memuat data/i })).toBeInTheDocument();
    expect(screen.getByText(mockError.message)).toBeInTheDocument(); // Cek pesan error

    // Verifikasi form dan loading tidak muncul
    expect(screen.queryByTestId('mock-edit-form')).not.toBeInTheDocument();
    expect(screen.queryByText(/memuat data profil/i)).not.toBeInTheDocument();

    // Verifikasi tombol "Kembali" berfungsi
    const backButton = screen.getByRole('button', {
      name: /kembali ke profil/i,
    });
    expect(backButton).toBeInTheDocument();
    await user.click(backButton);

    // Verifikasi handler (dari hook) dipanggil
    expect(mockHandleCancel).toHaveBeenCalledTimes(1);
  });
});
