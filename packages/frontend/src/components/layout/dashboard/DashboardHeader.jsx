import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useYoutubeStore } from '@/stores/youtubeStore';
import { Bell, Youtube, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

export default function DashboardHeader() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    channelProfile,
    isConnected,
    fetchChannelProfile,
    connectToGoogle,
    disconnectChannel, // Ambil fungsi disconnect
  } = useYoutubeStore();

  // Panggil profil YouTube saat dashboard dimuat
  useEffect(() => {
    fetchChannelProfile();
  }, [fetchChannelProfile]);

  // Handle Disconnect
  const handleDisconnect = async () => {
    await disconnectChannel();
    // Opsional: Refresh halaman atau redirect jika perlu
    navigate(0);
  };

  // Helper: Generate Breadcrumb Title dari URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'Overview';
    if (path.includes('/analysis')) return 'Analisis Video';
    if (path.includes('/history')) return 'Riwayat Analisis';
    if (path.includes('/config')) return 'Konfigurasi (Whitelist/Blacklist)';
    if (path.includes('/settings')) return 'Pengaturan Akun';
    if (path.includes('/guide')) return 'Panduan Penggunaan';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-white px-10 shadow-sm dark:bg-gray-950 dark:border-gray-800">
      {/* Left: Breadcrumbs */}
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 dark:text-gray-400">Pages / Dashboard</span>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{getPageTitle()}</h1>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Notif Icon */}
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
          <Bell size={20} />
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Youtube Profile Section */}
        {isConnected && channelProfile ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <div className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                {/* Text Info */}
                <div className="hidden text-right md:block">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {channelProfile.title}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] text-gray-500">Connected</p>
                  </div>
                </div>

                {/* Avatar */}
                <img
                  src={channelProfile.thumbnail}
                  alt={channelProfile.title}
                  className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                />

                {/* Icon Chevron (Indikator Menu) */}
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun YouTube</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDisconnect}
                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Putuskan Koneksi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* State Belum Connect */
          <button
            onClick={connectToGoogle}
            className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg"
          >
            <Youtube size={14} />
            Hubungkan Channel
          </button>
        )}
      </div>
    </header>
  );
}
