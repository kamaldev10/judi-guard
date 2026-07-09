import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';
import { Title } from 'react-head';
import { useAuthStore } from '@/stores/authStore';

const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const { currentUser } = useAuthStore();

  const userName = currentUser?.username || 'Pengguna';

  return (
    <>
      <Title>Ganti Password | Judi Guard</Title>
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-indigo-100 p-4">
        <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01] duration-500">
          {/* Tombol kembali */}
          <button
            onClick={() => navigate('/profile')}
            className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors duration-300"
            aria-label="Kembali ke profil"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span>Kembali</span>
          </button>

          {/*  header */}
          <div className="text-center mb-8 mt-6">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m-1.5 0h9m-9 0A2.25 2.25 0 006 11.25v7.5A2.25 2.25 0 008.25 21h7.5A2.25 2.25 0 0018 18.75v-7.5A2.25 2.25 0 0015.75 9z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Ganti Kata Sandi</h1>
            <p className="text-gray-500 mt-2">
              Mengamankan akun untuk{' '}
              <span className="font-semibold text-indigo-700">{userName}</span>
            </p>
          </div>
          {/* Form ganti password */}
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
};

export default ChangePasswordPage;
