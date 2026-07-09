import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Title } from 'react-head';
import { LogoWithSlogan } from '@/assets/images';
import OtpForm from '@/components/auth/OtpForm';

const OtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Email tidak ditemukan, harap registrasi ulang.', {
        position: 'bottom-right',
      });
      navigate('/register');
    }
  }, [email, navigate]);

  if (!email) {
    return <p>Memuat atau terjadi kesalahan...</p>;
  }

  return (
    <>
      <Title>Verifikasi OTP | Judi Guard</Title>
      <div className="relative fade-in-transition min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <div className="h-1/2 bg-blue-200"></div>
          <div className="h-1/2 bg-blue-100"></div>
        </div>

        <img
          src={LogoWithSlogan}
          alt="Judi Guard Logo"
          width={150}
          height={150}
          className="absolute top-5"
        />

        {/* Form OTP */}
        <OtpForm email={email} />
      </div>
    </>
  );
};

export default OtpPage;
