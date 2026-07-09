import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useYoutubeStore } from '@/stores/youtubeStore';
import LoginRequiredState from '@/components/status/LoginRequiredState';
import ConnectYoutubeState from '@/components/status/ConnectYoutubeState';
import PageLoader from '@/components/layout/PageLoader';

/**
 * FeatureGuard
 * @param {boolean} requireLogin - Jika true, user harus login (Member). Guest ditolak.
 * @param {boolean} requireYoutube - Jika true, user (Member/Guest) harus sudah connect channel.
 * @param {ReactNode} children - Konten halaman asli.
 */
export default function FeatureGuard({ requireLogin = false, requireYoutube = false, children }) {
  const { isLoadingAuth } = useAuthStore();
  const getIsAuthenticated = useAuthStore((state) => state.getIsAuthenticated);
  const { isConnected, isLoading: isLoadingYT, fetchChannelProfile } = useYoutubeStore();

  // Pastikan kita punya data channel terbaru saat masuk halaman ini
  useEffect(() => {
    fetchChannelProfile();
  }, [fetchChannelProfile]);

  // 1. Tampilkan Loading jika Auth/Youtube sedang proses cek
  if (isLoadingAuth || isLoadingYT) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // 2. Logic: Require Login (Member Only)
  // Jika butuh login, tapi user tidak ada ATAU user cuma Guest -> Blokir
  if (requireLogin) {
    if (!getIsAuthenticated) {
      return <LoginRequiredState />;
    }
  }

  // 3. Logic: Require YouTube
  // Jika butuh YouTube, tapi belum connect -> Blokir
  if (requireYoutube) {
    if (!isConnected) {
      return <ConnectYoutubeState />;
    }
  }

  // 4. logic: require login + youtube
  if (requireLogin && requireYoutube) {
    if (!getIsAuthenticated || !isConnected) {
      return <LoginRequiredState />;
    }
  }

  // 5. Lolos semua cek -> Tampilkan Halaman Asli
  return <>{children}</>;
}
