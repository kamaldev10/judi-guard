import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanSearch,
  History,
  ShieldAlert,
  LogOut,
  BookOpen,
  Globe,
} from 'lucide-react';
import { LogoWithSlogan } from '@/assets/images';
import { Button } from '@/shared/components/ui/button';

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const handleDirectToPublicSite = () => {
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { name: 'Analisis Video', path: '/dashboard/analysis', icon: ScanSearch },
    { name: 'Riwayat', path: '/dashboard/history', icon: History },
    { name: 'Konfigurasi', path: '/dashboard/config', icon: ShieldAlert },
    { name: 'Panduan Penggunaan', path: '/dashboard/guide', icon: BookOpen },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-white dark:border-gray-800 dark:bg-gray-950 md:flex">
      {/* Logo Area */}
      <div className="flex h-20 items-center justify-center border-b px-6 dark:border-gray-800">
        <img src={LogoWithSlogan} alt="Logo Judi Guard" className="w-32 p-2 " />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-3 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`
            }
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="border-t p-4 dark:border-gray-800">
        <Button
          variant="ghost"
          className="flex w-full justify-start items-center dark:border-gray-800 gap-3 text-gray-900 hover:bg-blue-300 hover:text-gray-800"
          onClick={handleDirectToPublicSite}
        >
          <Globe size={18} />
          Public Site
        </Button>
      </div>
    </aside>
  );
}
