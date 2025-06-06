// src/components/profile/ChangePasswordForm.jsx
import React, { useState } from "react";
import { changePasswordApi } from "../../services/api";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext"; // Asumsi Anda punya AuthContext
import { useNavigate } from "react-router-dom"; // Untuk navigasi setelah logout opsional

const ChangePasswordForm = () => {
  const { logout } = useAuth(); // Ambil fungsi logout dari AuthContext
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      // Contoh validasi minimal panjang password
      toast.error("Kata sandi baru harus minimal 8 karakter.", {
        position: "bottom-right",
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Kata sandi baru dan konfirmasi kata sandi tidak cocok.", {
        position: "bottom-right",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await changePasswordApi(currentPassword, newPassword);
      toast.success(response.message, { position: "bottom-right" });
      // Reset form fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      // Opsional: Logout user setelah ganti password untuk keamanan
      // Ini memaksa user untuk login ulang dengan password baru
      if (logout) {
        setTimeout(() => {
          logout(); // Panggil fungsi logout dari AuthContext
          toast.info("Silakan login kembali dengan kata sandi baru Anda.", {
            position: "bottom-right",
          });
          navigate("/login"); // Arahkan ke halaman login
        }, 2000); // Beri sedikit waktu untuk pesan muncul
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.message, { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Ganti Kata Sandi
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kata Sandi Saat Ini
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Kata Sandi Baru
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Konfirmasi Kata Sandi Baru
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Mengubah Kata Sandi..." : "Ubah Kata Sandi"}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
