import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useManagePasswordStore } from '@/stores/managePasswordStore';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const { forgotPassword, isLoading } = useManagePasswordStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        title: 'Input Tidak Valid',
        text: 'Alamat email wajib diisi.',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
        },
      });
      return;
    }

    try {
      await forgotPassword(email);

      Swal.fire({
        title: 'Permintaan Terkirim!',
        text: 'Kami telah mengirim email berisi instruksi untuk mereset kata sandi Anda. Periksa folder inbox dan spam Anda.',
        icon: 'success',
        confirmButtonText: 'Mengerti',
        customClass: {
          confirmButton: 'bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded',
        },
      });

      setEmail('');

      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      Swal.fire({
        title: 'Oops... Terjadi Kesalahan',
        text: error.message || 'Gagal mengirim permintaan reset password.',
        icon: 'error',
        confirmButtonText: 'Coba Lagi',
        customClass: {
          confirmButton: 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded',
        },
      });
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Lupa Kata Sandi?</h1>
      <p className="text-center text-gray-600 mb-6 text-sm">
        Jangan khawatir! Masukkan alamat email Anda yang terdaftar, dan kami akan mengirimkan
        instruksi untuk mereset kata sandi Anda.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Alamat Email
          </label>
          <input
            data-cy="email-input"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="email@anda.com"
            disabled={isLoading}
          />
        </div>

        <button
          data-cy="send-instructions-button"
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Mengirim Permintaan...' : 'Kirim Instruksi Reset'}
        </button>
      </form>
    </>
  );
};

export default ForgotPasswordForm;
