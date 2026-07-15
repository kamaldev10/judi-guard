import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthUiStore } from '@/modules/auth';
import { ShieldAlert, LayoutDashboard } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthUiStore((state) => state.isAuthenticated);
  const isLoadingAuth = useAuthUiStore((state) => state.isLoadingAuth);
  const currentUser = useAuthUiStore((state) => state.currentUser);
  const getSession = useAuthUiStore((state) => state.getSession);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getSession();
  }, [getSession]);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isLoadingAuth, isAuthenticated]);

  const handleRedirect = () => {
    navigate('/login');
  };

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (showModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900 text-center space-y-6 transform transition-all scale-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
            <ShieldAlert size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Akses Dibatasi</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke halaman
              utama.
            </p>
          </div>

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

  // ponytail: pass role ke outlet context untuk digunakan DashboardLayout jika perlu
  return <Outlet context={{ userRole: currentUser?.role }} />;
};

export default ProtectedRoute;
