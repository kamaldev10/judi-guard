import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditProfileForm from '../EditProfileForm';

// --- Mocking Dependencies ---

// 1. Mock 'framer-motion'
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef((props, ref) => <div {...props} ref={ref} />),
    button: React.forwardRef((props, ref) => <button {...props} ref={ref} />),
  },
}));

// 2. Mock 'lucide-react' icons (gunakan data-testid)
vi.mock('lucide-react', () => ({
  User: (props) => <svg data-testid="user-icon" {...props} />,
  Mail: (props) => <svg data-testid="mail-icon" {...props} />,
  Save: (props) => <svg data-testid="save-icon" {...props} />,
  XCircle: (props) => <svg data-testid="xcircle-icon" {...props} />,
  Loader2: (props) => <svg data-testid="loader-icon" {...props} />,
  ArrowLeft: (props) => <svg data-testid="arrowleft-icon" {...props} />,
}));

// --- Test Suite ---

describe('Edit Profile Form Component Testing', () => {
  const user = userEvent.setup();

  // 3. Siapkan mock functions untuk props event handler
  const mockOnSubmit = vi.fn((e) => e.preventDefault()); // Prevent default form submission
  const mockOnInputChange = vi.fn();
  const mockOnCancel = vi.fn();

  // 4. Siapkan data default untuk props
  const defaultFormData = {
    email: 'test@example.com',
    username: 'testuser',
  };

  // 5. Props default untuk render
  const defaultProps = {
    formData: defaultFormData,
    isSaving: false,
    onSubmit: mockOnSubmit,
    onInputChange: mockOnInputChange,
    onCancel: mockOnCancel,
  };

  // 6. Bersihkan mock sebelum setiap tes
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Tes 1: Render Awal (State Normal)
  it('should render correctly with initial data and enabled inputs/buttons', () => {
    render(<EditProfileForm {...defaultProps} />);

    // Cek judul dan tombol kembali
    expect(screen.getByRole('heading', { name: /edit profil anda/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kembali ke profil/i })).toBeEnabled();

    // Cek input Email (harus disabled)
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveValue(defaultFormData.email);
    expect(emailInput).toBeDisabled(); // Email selalu disabled

    // Cek input Username (harus enabled)
    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveValue(defaultFormData.username);
    expect(usernameInput).toBeEnabled();

    // Cek tombol aksi (harus enabled)
    const cancelButton = screen.getByRole('button', { name: /batal/i });
    expect(cancelButton).toBeEnabled();
    const saveButton = screen.getByRole('button', {
      name: /simpan perubahan/i,
    });
    expect(saveButton).toBeEnabled();

    // Cek ikon yang seharusnya ada (tidak ada loader)
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('save-icon')).toBeInTheDocument();
    expect(screen.getByTestId('xcircle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('arrowleft-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
  });

  it('should call onInputChange with correct event name when username is changed', async () => {
    render(<EditProfileForm {...defaultProps} />);
    const usernameInput = screen.getByLabelText(/username/i);

    // Simulasikan aksi pengguna
    await user.clear(usernameInput);
    await user.type(usernameInput, 'new');

    // 1. Verifikasi jumlah pemanggilan (opsional, tapi bagus)
    expect(mockOnInputChange).toHaveBeenCalledTimes(4);

    // 2. Verifikasi nama input pada panggilan pertama (atau panggilan mana pun)
    //    Ini cukup untuk membuktikan handler dipanggil dari input yang benar.
    expect(mockOnInputChange.mock.calls[0][0].target.name).toBe('username');
  });

  // Tes 4: Interaksi Tombol Submit (onSubmit)
  it('should call onSubmit when Save Changes button is clicked', async () => {
    render(<EditProfileForm {...defaultProps} />);
    const saveButton = screen.getByRole('button', {
      name: /simpan perubahan/i,
    });

    await user.click(saveButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  // Tes 5: State Saving (isSaving = true)
  it('should disable inputs/buttons and show loading state when isSaving is true', () => {
    // Render dengan isSaving = true
    render(<EditProfileForm {...defaultProps} isSaving={true} />);

    // Cek input Username (disabled)
    expect(screen.getByLabelText(/username/i)).toBeDisabled();

    // Cek tombol aksi (disabled)
    expect(screen.getByRole('button', { name: /batal/i })).toBeDisabled();
    const saveButton = screen.getByRole('button', { name: /menyimpan/i }); // Teks berubah
    expect(saveButton).toBeDisabled();

    // Cek ikon (ada loader, tidak ada save)
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('save-icon')).not.toBeInTheDocument();

    // Cek teks tombol save
    expect(saveButton).toHaveTextContent(/menyimpan/i);
    expect(saveButton).not.toHaveTextContent(/simpan perubahan/i);
  });
});
