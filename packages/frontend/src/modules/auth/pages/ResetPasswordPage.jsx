import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ResetPasswordForm from '../components/ResetPasswordForm.jsx';
import { Title } from 'react-head';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      toast.error('Token reset tidak ditemukan atau tidak lengkap di URL.', {
        position: 'bottom-right',
      });
    }
  }, [token]);

  const handleInvalidToken = () => {
    setIsTokenValid(false);
  };

  if (!isTokenValid) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
            <h2 className="text-3xl font-bold text-red-600 mb-6">Token Tidak Valid</h2>
            <p className="text-gray-600 mb-8">
              Token reset kata sandi yang Anda gunakan tidak valid, tidak ditemukan, atau sudah
              kedaluwarsa. Silakan minta tautan reset baru.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-medium"
            >
              Minta Reset Kata Sandi Baru
            </Link>
            <Link to="/login" className="mt-4 block text-sm text-gray-600 hover:text-gray-800">
              Kembali ke Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <Title>Reset Password | Judi Guard</Title>

      <ResetPasswordForm token={token} onInvalidToken={handleInvalidToken} />
    </div>
  );
};

export default ResetPasswordPage;
