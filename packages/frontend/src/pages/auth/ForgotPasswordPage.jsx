import React from 'react';
import { Link } from 'react-router-dom';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Title } from 'react-head';

const ForgotPasswordPage = () => {
  return (
    <>
      <Title>Lupa Password | Judi Guard</Title>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          {/* Form Forgot Password */}
          <ForgotPasswordForm />

          {/* Link kembali ke login */}
          <div className="flex justify-center mt-4">
            <p className="text-center text-sm">
              Kembali ke halaman{' '}
              <Link to="/login" className="text-black ms-1 font-medium hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
