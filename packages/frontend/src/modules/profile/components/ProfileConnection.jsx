import React from 'react';
import {
  useConnectYoutubeMutation,
  useDisconnectYoutubeMutation,
} from '../hooks/useProfileQueries.js';
import { Loader2, Unlink, RefreshCw, Youtube, Link2Icon } from 'lucide-react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function ProfileConnection({ user }) {
  const connectMutation = useConnectYoutubeMutation();
  const disconnectMutation = useDisconnectYoutubeMutation();

  const isYoutubeConnected = !!user?.youtubeChannelId;
  const youtubeChannelInfo =
    user && user.youtubeChannelId
      ? {
          name: user.youtubeChannelName,
          thumbnailUrl: user.youtubeChannelThumbnail,
        }
      : null;

  const handleConnectYouTubeAccount = async () => {
    try {
      const data = await connectMutation.mutateAsync();
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error('URL otorisasi tidak diterima dari server.');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memulai koneksi ke YouTube.');
    }
  };

  const handleDisconnectYouTubeAccount = async () => {
    const confirmResult = await Swal.fire({
      title: 'Putuskan Hubungan Akun?',
      text: 'Anda akan memutuskan hubungan akun YouTube Anda.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, putuskan!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-xl shadow-lg text-sm' },
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await disconnectMutation.mutateAsync();
      toast.success('Akun YouTube berhasil diputuskan.');
    } catch (err) {
      toast.error(err.message || 'Gagal memutuskan koneksi.');
    }
  };

  const isConnectingYouTube = connectMutation.isPending;
  const isDisconnectingYouTube = disconnectMutation.isPending;

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-950 border dark:border-gray-850 shadow-sm rounded-xl p-6 md:p-8"
      aria-labelledby="connections-heading"
    >
      <h1
        id="connections-heading"
        className="text-xl font-bold text-slate-800 dark:text-white mb-5 flex items-center"
      >
        <Link2Icon size={24} className="mr-3 text-cyan-600 dark:text-cyan-400" />
        Akun Terhubung
      </h1>

      <div className="p-4 bg-slate-50 dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium text-slate-700 dark:text-gray-200 flex items-center">
            <Youtube size={20} className="text-red-500 mr-2 animate-pulse" />
            Akun YouTube
          </h2>
          {(isConnectingYouTube || isDisconnectingYouTube) && (
            <Loader2 size={20} className="animate-spin text-sky-500" />
          )}
        </div>

        {/* Menampilkan info channel jika terhubung */}
        {isYoutubeConnected && youtubeChannelInfo && (
          <div className="flex items-center mb-4 p-3 bg-sky-100/50 dark:bg-sky-950/40 rounded-md border border-sky-300 dark:border-sky-900 shadow-sm">
            {youtubeChannelInfo.thumbnailUrl && (
              <img
                src={youtubeChannelInfo.thumbnailUrl}
                alt="Thumbnail Channel YouTube"
                className="w-10 h-10 rounded-full mr-3 border-2 border-white dark:border-gray-900 shadow-sm object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-gray-100 truncate">
                {youtubeChannelInfo.name || 'Nama Channel Tidak Diketahui'}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Terhubung</p>
            </div>
          </div>
        )}

        {/* Tombol Aksi YouTube */}
        <div className="space-y-3">
          {!isYoutubeConnected ? (
            <button
              onClick={handleConnectYouTubeAccount}
              disabled={isConnectingYouTube}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isConnectingYouTube ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Link2Icon size={16} className="mr-2" />
              )}
              {isConnectingYouTube ? 'Mengarahkan...' : 'Hubungkan Akun YouTube'}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              {/* Tombol Perbarui Izin/Sinkronkan Ulang */}
              <button
                onClick={handleConnectYouTubeAccount}
                disabled={isConnectingYouTube || isDisconnectingYouTube}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Perbarui izin atau sinkronkan ulang koneksi YouTube Anda."
              >
                {isConnectingYouTube ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                {isConnectingYouTube ? 'Memproses...' : 'Perbarui Izin YouTube'}
              </button>

              {/* Tombol Putuskan Hubungan */}
              <button
                onClick={handleDisconnectYouTubeAccount}
                disabled={isDisconnectingYouTube}
                className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {isDisconnectingYouTube ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <Unlink size={16} className="mr-2" />
                )}
                {isDisconnectingYouTube ? 'Memutuskan...' : 'Putuskan Hubungan YouTube'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
