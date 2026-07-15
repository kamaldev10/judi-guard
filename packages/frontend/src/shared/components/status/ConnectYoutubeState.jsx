import { useConnectGoogleMutation } from '@/modules/profile';
import { Button } from '@/shared/components/ui/button';
import { Youtube, Cable, PlaySquare, ShieldAlert } from 'lucide-react';

export default function ConnectYoutubeState() {
  const connectMutation = useConnectGoogleMutation();

  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/50">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800">
        <Cable size={48} className="text-red-500" />
      </div>

      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Koneksi YouTube Diperlukan
      </h2>

      <p className="mb-6 max-w-lg text-gray-500 dark:text-gray-400">
        Untuk melakukan analisis komentar atau melihat statistik channel, sistem membutuhkan izin
        akses ("Token") untuk membaca data secara <i>real-time</i>.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8 max-w-2xl text-left text-sm">
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-950">
          <Youtube className="mb-2 text-red-500" size={24} />
          <span className="font-semibold text-gray-900 dark:text-white">Aman & Resmi</span>
          <p className="text-gray-500 text-xs mt-1">Menggunakan Google OAuth 2.0 resmi.</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-950">
          <PlaySquare className="mb-2 text-blue-500" size={24} />
          <span className="font-semibold text-gray-900 dark:text-white">Hanya Komentar</span>
          <p className="text-gray-500 text-xs mt-1">Kami hanya mengelola data komentar.</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-950">
          <ShieldAlert className="mb-2 text-green-500" size={24} />
          <span className="font-semibold text-gray-900 dark:text-white">Privasi Terjaga</span>
          <p className="text-gray-500 text-xs mt-1">Token tersimpan aman dan terenkripsi.</p>
        </div>
      </div>

      <Button
        onClick={() => connectMutation.mutate()}
        disabled={connectMutation.isPending}
        className="h-12 bg-red-600 px-8 text-lg font-semibold text-white shadow-lg shadow-red-600/20 hover:bg-red-700"
      >
        {connectMutation.isPending ? 'Menghubungkan...' : 'Hubungkan Channel Sekarang'}
      </Button>
    </div>
  );
}
