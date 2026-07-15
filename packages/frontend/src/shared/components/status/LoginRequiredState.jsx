import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { LogIn } from 'lucide-react';
// Import gambar aset Anda
import notLoginImg from '@/assets/images/notLogin.svg';

export default function LoginRequiredState() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm animate-in fade-in zoom-in-95 duration-300 dark:bg-gray-950">
      {/* Ilustrasi */}
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-pulse rounded-full bg-blue-100 opacity-50 blur-2xl dark:bg-blue-900/20" />
        <img
          src={notLoginImg}
          alt="Login Required"
          className="relative h-48 w-auto object-contain"
        />
      </div>

      {/* Konten Teks */}
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Akses Terbatas untuk Member
      </h2>
      <p className="mb-8 max-w-md text-gray-500 dark:text-gray-400">
        Fitur ini membutuhkan penyimpanan database pribadi (seperti Blacklist & Whitelist). Silakan
        masuk atau daftar untuk melanjutkan.
      </p>

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 bg-blue-600 px-8 hover:bg-blue-700"
        >
          <LogIn size={18} />
          Masuk Akun
        </Button>
        <Button variant="outline" onClick={() => navigate('/register')} className="px-8">
          Daftar Sekarang
        </Button>
      </div>
    </div>
  );
}
