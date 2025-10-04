// src/pages/auth/ForgotPasswordPage.jsx (Contoh Komponen)
import { forgotPasswordApi } from "@/lib/services";
import React, { useState } from "react";
import Swal from "sweetalert2"; // Impor SweetAlert2
// import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      Swal.fire({
        title: "Input Tidak Valid",
        text: "Alamat email wajib diisi.",
        icon: "warning",
        confirmButtonText: "OK",
        customClass: {
          // Styling kustom jika diperlukan
          confirmButton:
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
        },
      });
      return;
    }
    setIsLoading(true);

    try {
      // Panggil forgotPasswordApi. Ia akan mengembalikan { success: true, message: "..." }
      const backendResponse = await forgotPasswordApi(email);

      // Tampilkan SweetAlert sukses dengan pesan dari backend
      // (pesan ini sekarang akan selalu generik untuk semua kasus sukses)
      Swal.fire({
        title: "Permintaan Terkirim!",
        text: backendResponse.message, // Menggunakan pesan dari backend
        icon: "success",
        confirmButtonText: "Mengerti",
        customClass: {
          confirmButton:
            "bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded",
        },
      });

      setEmail(""); // Kosongkan field email setelah berhasil
      // Opsional: navigasi ke halaman login atau halaman informasi
      // setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      // Menangkap error yang dilempar oleh forgotPasswordApi (error HTTP)
      Swal.fire({
        title: "Oops... Terjadi Kesalahan",
        text: error.message, // error.message sudah diformat oleh forgotPasswordApi
        icon: "error",
        confirmButtonText: "Coba Lagi",
        customClass: {
          confirmButton:
            "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Lupa Kata Sandi?
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Jangan khawatir! Masukkan alamat email Anda yang terdaftar dan kami
          akan mengirimkan instruksi untuk mereset kata sandi Anda.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alamat Email
            </label>
            <input
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
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "Mengirim Permintaan..." : "Kirim Instruksi Reset"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
