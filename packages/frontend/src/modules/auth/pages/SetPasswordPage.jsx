import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Title } from 'react-head';
import { LogoWithSlogan } from '@/assets/images';
import SetPasswordForm from '../components/SetPasswordForm.jsx';

const SetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const tempToken = location.state?.tempToken;

  useEffect(() => {
    if (!email || !tempToken) {
      toast.error('Sesi tidak valid, silakan login ulang.', {
        position: 'bottom-right',
      });
      navigate('/login');
    }
  }, [email, tempToken, navigate]);

  if (!email || !tempToken) {
    return <p>Memuat atau terjadi kesalahan...</p>;
  }

  return (
    <>
      <Title>Set Password | Judi Guard</Title>
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

        <div className="z-10 w-full max-w-md bg-transparent p-8">
          <SetPasswordForm email={email} tempToken={tempToken} />
        </div>
      </div>
    </>
  );
};

export default SetPasswordPage;
