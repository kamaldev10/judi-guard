import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { PasswordInput } from '@/shared/components/ui/PasswordInput.jsx';
import { useResetPasswordMutation } from '../hooks/useAuthMutations.js';

const ResetPasswordForm = ({ token, onInvalidToken }) => {
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPasswordMutation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Kata sandi baru minimal harus 6 karakter.', {
        position: 'bottom-right',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Kata sandi baru dan konfirmasi tidak cocok.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        token,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      });

      toast.success(response.message || 'Kata sandi berhasil direset!', {
        position: 'bottom-right',
        toastId: 'reset-password-success',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Gagal mereset kata sandi. Token mungkin tidak valid atau sudah kedaluwarsa.';

      toast.error(errorMessage, {
        position: 'bottom-right',
        toastId: 'reset-password-error',
      });

      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        onInvalidToken?.();
      }
    }
  };

  const isLoading = resetPasswordMutation.isPending;

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Reset Kata Sandi</h2>
      <p className="text-center text-gray-600 mb-8">Masukkan kata sandi baru Anda di bawah ini.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PasswordInput
          data-cy="new-password-input"
          id="password"
          label="Kata Sandi Baru (minimal 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          show={showPassword}
          setShow={setShowPassword}
          isLoading={isLoading}
        />

        <PasswordInput
          data-cy="confirm-password-input"
          id="confirmPassword"
          label="Konfirmasi Kata Sandi Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          show={showConfirm}
          setShow={setShowConfirm}
          isLoading={isLoading}
        />

        <button
          data-cy="reset-password-button"
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Sedang Memproses...' : 'Reset Kata Sandi'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
