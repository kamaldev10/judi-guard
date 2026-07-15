import { useAuthUiStore } from '@/modules/auth';
import { useYoutubeChannelQuery } from '@/modules/profile';
import LoginRequiredState from '@/shared/components/status/LoginRequiredState';
import ConnectYoutubeState from '@/shared/components/status/ConnectYoutubeState';
import PageLoader from '@/shared/components/layout/PageLoader';

/**
 * FeatureGuard
 * @param {boolean} requireLogin - Jika true, user harus login.
 * @param {string[]} allowedRoles - Array of role yang diizinkan (opsional, dievaluasi setelah requireLogin).
 * @param {boolean} requireYoutube - Jika true, user harus sudah connect channel.
 * @param {ReactNode} children - Konten halaman asli.
 */
export default function FeatureGuard({
  requireLogin = false,
  allowedRoles,
  requireYoutube = false,
  children,
}) {
  const isLoadingAuth = useAuthUiStore((state) => state.isLoadingAuth);
  const getIsAuthenticated = useAuthUiStore((state) => state.getIsAuthenticated);
  const currentUser = useAuthUiStore((state) => state.currentUser);
  const { data: channelProfile, isLoading: isLoadingYT } = useYoutubeChannelQuery();
  const isConnected = !!channelProfile;

  if (isLoadingAuth || isLoadingYT) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  if (requireLogin) {
    if (!getIsAuthenticated()) {
      return <LoginRequiredState />;
    }
  }

  // ponytail: allowedRoles cek setelah login, reuse LoginRequiredState sebagai ForbiddenState
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
    return <LoginRequiredState />;
  }

  if (requireYoutube) {
    if (!isConnected) {
      return <ConnectYoutubeState />;
    }
  }

  return <>{children}</>;
}
