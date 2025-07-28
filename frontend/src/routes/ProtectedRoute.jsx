// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Sesuaikan path
import Loader from "../components/loader/Loader"; // Impor komponen Loader fullscreen Anda

/**
 * Komponen pembungkus untuk rute yang memerlukan autentikasi.
 * Ia akan menunggu proses verifikasi sesi awal selesai sebelum membuat keputusan.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // 1. Jika AuthContext masih dalam proses verifikasi token awal,
  // tampilkan loading screen. Ini adalah langkah paling penting.
  // Ini mencegah redirect prematur atau render halaman dengan data null.
  if (isLoadingAuth) {
    return <Loader />; // Tampilkan loader fullscreen Anda
  }

  // 2. Setelah loading selesai, periksa status isAuthenticated.
  // Jika tidak terautentikasi, arahkan ke halaman login.
  if (!isAuthenticated) {
    // `replace` akan mengganti history, sehingga pengguna tidak bisa menekan "kembali" ke halaman profil.
    return <Navigate to="/login" replace />;
  }

  // 3. Jika terautentikasi, render halaman yang diminta (Profile, Dashboard, dll.).
  return <Outlet />;
};

export default ProtectedRoute;
