import { useAuthStore } from "@/stores/authStore";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function overviewPage() {
  const user = useAuthStore((state) => state.currentUser);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg sm:p-12">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Halo, {user?.username || user?.name || "Partner"}! 👋
          </h1>
          <p className="mt-4 text-lg text-blue-100 leading-relaxed">
            Selamat datang di pusat kendali <strong>Judi Guard</strong>. Sistem
            kami siap membantu Anda mendeteksi dan membersihkan komentar spam
            perjudian di channel YouTube Anda secara otomatis.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/dashboard/analysis">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-200 border-none shadow-md font-bold px-8 h-12 cursor-pointer"
              >
                <Search className="mr-2 h-5 w-5" />
                Mulai Analisis Video
              </Button>
            </Link>

            <Link to="/dashboard/guide">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-blue-600 hover:text-gray-50 shadow-md font-bold px-8 h-12 cursor-pointer"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Baca Panduan
              </Button>
            </Link>
          </div>
        </div>

        {/* Dekorasi Background */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 blur-3xl transform rotate-12 translate-x-20 -translate-y-10" />
        <div className="absolute bottom-0 right-20 h-32 w-32 rounded-full bg-blue-500/30 blur-2xl" />
      </div>

      {/* 2. SHORTCUTS / MENU CEPAT */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Analisis */}
        <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:bg-gray-950 dark:border-gray-800 dark:hover:border-blue-900">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
            Analisis Komentar
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Tempel link video YouTube, biarkan AI memindai ribuan komentar, lalu
            hapus spam judi dalam sekali klik.
          </p>
          <div className="mt-4">
            <Link
              to="/dashboard/analysis"
              className="text-sm font-medium text-blue-600 hover:underline flex items-center"
            >
              Pergi ke halaman analisis{" "}
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Card: Konfigurasi */}
        <div className="group rounded-xl border bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md dark:bg-gray-950 dark:border-gray-800 dark:hover:border-orange-900">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/20">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600">
            Konfigurasi Proteksi
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Kelola <strong>Whitelist</strong> (Channel Aman) dan{" "}
            <strong>Blacklist</strong> (Kata Terlarang) untuk hasil deteksi yang
            lebih akurat.
          </p>
          <div className="mt-4">
            <Link
              to="/dashboard/config"
              className="text-sm font-medium text-orange-600 hover:underline flex items-center"
            >
              Atur konfigurasi <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
