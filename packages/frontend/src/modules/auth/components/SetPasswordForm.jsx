import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSetPasswordMutation } from '../hooks/useAuthMutations.js';
import { validateRegistrationPassword } from '@/shared/utils/formValidators.js';

const SetPasswordForm = ({ email, tempToken }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setPasswordMutation = useSetPasswordMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const pwError = validateRegistrationPassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }
    setError('');

    try {
      // ponytail: frontend kirim email+password, backend handle setPasswordAfterOtp
      // tempToken dari verify-otp sudah diverifikasi di backend
      await setPasswordMutation.mutateAsync({ email, password });
      toast.success('Password berhasil dibuat!', {
        position: 'bottom-right',
        toastId: 'toast-set-password-success',
      });
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Gagal membuat password.', {
        position: 'bottom-right',
      });
    }
  };

  const isLoading = setPasswordMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-center text-teal-700 font-bold text-xl mb-5">Buat Password</h1>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Buat password untuk akun <strong>{email}</strong>
      </p>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm text-black mb-1 font-semibold">
          Password
        </label>
        <div className="relative flex items-center">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white text-black border-gray-300 focus:ring-teal-700"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm text-black mb-1 font-semibold">
          Konfirmasi Password
        </label>
        <div className="relative flex items-center">
          <input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-1 border rounded-xl focus:outline-none focus:ring-2 bg-white text-black border-gray-300 focus:ring-teal-700"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 text-gray-500"
          >
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        data-cy="set-password-button"
        disabled={isLoading || !password || !confirmPassword}
        className="w-full py-1 mt-2 bg-[#25c0d4] text-white font-semibold border rounded-xl hover:bg-[#089db1] transition disabled:opacity-50"
      >
        {isLoading ? 'Menyimpan...' : 'Simpan Password'}
      </button>
    </form>
  );
};

export default SetPasswordForm;
