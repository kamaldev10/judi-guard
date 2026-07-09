import React from 'react';
import { Title } from 'react-head';
import { LogoWithSlogan } from '@/assets/images';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  return (
    <>
      <Title>Register | Judi Guard</Title>
      <div className="relative fade-in-transition min-h-screen flex items-center justify-center ">
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
          <RegisterForm />
        </div>
      </div>
    </>
  );
};

export default Register;
