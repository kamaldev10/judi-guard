// src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPasswordApi } from "../../lib/services/auth/authApi";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Ambil token dari URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenInitiallyValid, setIsTokenInitiallyValid] = useState(true); // Asumsi valid di awal, akan diuji saat submit

  useEffect(() => {
    // Validasi dasar: cek apakah token ada di URL.
    // Validasi token ke backend saat load halaman adalah opsional tapi bisa meningkatkan UX.
    // Contoh: GET /api/auth/validate-reset-token/:token
    // Jika diimplementasikan, setIsTokenInitiallyValid akan di-set berdasarkan responsnya.
    if (!token) {
      setIsTokenInitiallyValid(false);
      toast.error("Token reset tidak ditemukan atau tidak lengkap di URL.", {
        position: "bottom-right",
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      // Disesuaikan dengan skema backend min(6)
      toast.error("Kata sandi baru minimal harus 6 karakter.", {
        position: "bottom-right",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Kata sandi baru dan konfirmasi kata sandi tidak cocok.", {
        position: "bottom-right",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Pastikan resetPasswordApi mengirimkan objek { password, confirmPassword }
      // jika backend Anda mengharapkannya (sesuai resetPasswordSchema).
      // Jika resetPasswordApi(token, password) adalah signature lama,
      // Anda mungkin perlu resetPasswordApi(token, { password, confirmPassword })
      // atau memodifikasi implementasi resetPasswordApi.
      // Untuk contoh ini, kita asumsikan resetPasswordApi di-update untuk mengirim payload yang benar.
      const response = await resetPasswordApi(token, {
        password,
        confirmPassword,
      }); // Mengirim objek

      toast.success(response.message || "Kata sandi berhasil direset!", {
        position: "bottom-right",
      });
      setTimeout(() => {
        navigate("/login"); // Arahkan ke halaman login setelah berhasil
      }, 2000); // Beri waktu 2 detik untuk membaca pesan
    } catch (error) {
      console.error("Reset password error:", error);
      // Jika backend mengembalikan error karena token (misal status 400),
      // kita bisa menganggap token tidak valid.
      // Pesan error dari backend lebih diutamakan.
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Gagal mereset kata sandi. Token mungkin tidak valid atau sudah kedaluwarsa.";
      toast.error(errorMessage, { position: "bottom-right" });

      // Jika error spesifik karena token (misalnya backend mengembalikan status 400 atau 401 untuk token invalid)
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        setIsTokenInitiallyValid(false); // Set token menjadi tidak valid setelah percobaan submit gagal karena token
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenInitiallyValid) {
    // Tampilan jika token dianggap tidak valid dari awal (misal, tidak ada di URL atau gagal validasi awal)
    // atau setelah gagal submit karena token.
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-6">
            Token Tidak Valid
          </h2>
          <p className="text-gray-600 mb-8">
            Token reset kata sandi yang Anda gunakan tidak valid, tidak
            ditemukan, atau sudah kedaluwarsa. Silakan minta tautan reset kata
            sandi baru jika diperlukan.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out font-medium"
          >
            Minta Reset Kata Sandi Baru
          </Link>
          <Link
            to="/login"
            className="mt-4 block text-sm text-gray-600 hover:text-gray-800"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Reset Kata Sandi
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Masukkan kata sandi baru Anda di bawah ini. Pastikan kata sandi baru
          Anda kuat dan mudah diingat.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Kata Sandi Baru (minimal 6 karakter)
            </label>
            <input
              type="password"
              id="password"
              name="password" // Tambahkan atribut name untuk praktik terbaik form
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6" // Validasi HTML dasar
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword" // Tambahkan atribut name
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6" // Validasi HTML dasar
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Sedang Memproses..." : "Reset Kata Sandi"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Kembali ke Halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
