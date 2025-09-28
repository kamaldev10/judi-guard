import React from "react";
import NotLoginImage from "../../assets/images/notLogin.svg";

const NotLogin = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-5 text-center font-sans text-gray-800">
      <img
        src={NotLoginImage}
        alt="Anda belum login"
        className="w-48 max-w-[60%] sm:w-64 sm:max-w-[50%] md:w-80 md:max-w-[40%] mb-8"
      />
      <h2 className="text-2xl sm:text-3xl font-bold text-red-600 mb-4">
        Anda Belum Login
      </h2>
      <p className="text-base leading-relaxed mb-2 max-w-md">
        Untuk mengakses fitur ini, Anda perlu login terlebih dahulu.
      </p>
      <p className="text-base leading-relaxed mb-6 max-w-md">
        Silakan kembali ke halaman login atau daftar jika Anda belum memiliki
        akun.
      </p>

      {/* Opsional: Tombol untuk navigasi ke halaman login */}
      {/*
      <button
        onClick={() => {
          // Implementasikan navigasi ke halaman login Anda di sini
          // Misalnya, jika menggunakan React Router:
          // import { useNavigate } from 'react-router-dom';
          // const navigate = useNavigate();
          // navigate('/login');
          console.log("Navigasi ke halaman login...");
        }}
        className="mt-6 py-3 px-6 text-base text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
      >
        Login Sekarang
      </button>
      */}
    </div>
  );
};

export default NotLogin;
