import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { PasswordInput } from '@/components/ui/PasswordInput';
import { useManagePasswordStore } from '@/stores/managePasswordStore';
import { useAuthStore } from '@/stores/authStore';

/** Komponen utama form ubah password */
const ChangePasswordForm = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { changePassword, isLoading } = useManagePasswordStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Kata sandi baru harus minimal 8 karakter.', {
        position: 'bottom-right',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Kata sandi baru dan konfirmasi kata sandi tidak cocok.', {
        position: 'bottom-right',
      });
      return;
    }

    try {
      const response = await changePassword(currentPassword, newPassword, confirmPassword);

      toast.success(response.message, {
        position: 'bottom-right',
        toastId: 'change-password-success',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        logout();
        toast.success('Berhasil! Silakan login kembali dengan sandi baru Anda.', {
          position: 'bottom-right',
          toastId: 'change-password-logout-success',
        });
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Terjadi kesalahan.', {
        position: 'bottom-right',
        toastId: 'change-password-error',
      });
    }
  };

  return (
    <>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <PasswordInput
          data-cy="current-password-input"
          id="currentPassword"
          label="Kata Sandi Saat Ini"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          show={showCurrent}
          setShow={setShowCurrent}
          disabled={isLoading}
        />

        <PasswordInput
          data-cy="new-password-input"
          id="newPassword"
          label="Kata Sandi Baru"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          show={showNew}
          setShow={setShowNew}
          disabled={isLoading}
        />

        <PasswordInput
          data-cy="confirm-password-input"
          id="confirmPassword"
          label="Konfirmasi Kata Sandi Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          show={showConfirm}
          setShow={setShowConfirm}
          disabled={isLoading}
        />

        <button
          data-cy="change-password-button"
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed font-semibold transform hover:scale-105"
        >
          {isLoading ? 'Memperbarui...' : 'Ubah Kata Sandi'}
        </button>
      </form>
    </>
  );
};

export default ChangePasswordForm;
