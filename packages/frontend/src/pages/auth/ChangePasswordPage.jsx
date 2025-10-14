import React, { useState, memo } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, UserCircle, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores";

// Komponen Input Kata Sandi (tidak ada perubahan fungsional)
const PasswordInput = memo(
  ({ id, label, value, onChange, show, setShow, isLoading }) => (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-600 mb-2"
      >
        {label}
      </label>
      <div className="relative">
        <KeyRound
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type={show ? "text" : "password"}
          id={id}
          value={value}
          onChange={onChange}
          required
          disabled={isLoading}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-300 disabled:bg-gray-100"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-indigo-600 focus:outline-none transition-colors duration-300"
          tabIndex={-1}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  )
);

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  // Mengambil data pengguna dan fungsi dari AuthStore
  const { currentUser, changePassword, logout } = useAuthStore();

  // Mendapatkan nama pengguna dengan fallback jika tidak ada
  const userName = currentUser?.username || "Pengguna";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
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
      const response = await changePassword(
        currentPassword,
        newPassword,
        confirmNewPassword
      );
      toast.success(response.message, { position: "bottom-right" });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setTimeout(() => {
        logout();
        toast.info("Berhasil! Silakan login kembali dengan sandi baru Anda.", {
          position: "bottom-right",
        });
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.message, { position: "bottom-right" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-100 p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-[1.01] duration-500">
        {/* Tombol Kembali ke Profil */}
        <button
          onClick={() => navigate("/profile")}
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium transition-colors duration-300"
          aria-label="Kembali ke profil"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Kembali</span>
        </button>

        {/* Header dengan Informasi Pengguna */}
        <div className="text-center mb-8 mt-6">
          <div className="inline-block p-3 bg-indigo-100 rounded-full mb-3">
            <UserCircle size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Ganti Kata Sandi</h1>
          <p className="text-gray-500 mt-2">
            Mengamankan akun untuk{" "}
            <span className="font-semibold text-indigo-700">{userName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordInput
            id="currentPassword"
            label="Kata Sandi Saat Ini"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            show={showCurrent}
            setShow={setShowCurrent}
            isLoading={isLoading}
          />

          <PasswordInput
            id="newPassword"
            label="Kata Sandi Baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            setShow={setShowNew}
            isLoading={isLoading}
          />

          <PasswordInput
            id="confirmNewPassword"
            label="Konfirmasi Kata Sandi Baru"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            show={showConfirm}
            setShow={setShowConfirm}
            isLoading={isLoading}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed font-semibold transform hover:scale-105"
            disabled={isLoading}
          >
            {isLoading ? "Memperbarui..." : "Ubah Kata Sandi"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
