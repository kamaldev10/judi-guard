import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ShieldAlert, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth, getSession } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  // 1. Cek Session saat component dimuat
  useEffect(() => {
    getSession();
  }, [getSession]);

  // 2. Pantau perubahan auth state
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isLoadingAuth, isAuthenticated]);

  // Handler tombol di modal
  const handleRedirect = () => {
    navigate("/login");
  };

  // Tampilan Loading (Opsional: Bisa ganti skeleton/spinner)
  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Jika TIDAK Authenticated -> Tampilkan Modal Blokir
  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-center space-y-6 transform transition-all scale-100">
          {/* Icon Header */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
            <ShieldAlert size={32} />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Akses Dibatasi
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Anda tidak memiliki izin untuk mengakses halaman ini. Silakan
              kembali ke halaman utama.
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleRedirect}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={18} />
            Ke Halaman Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Jika Authenticated -> Render Halaman Tujuan (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
