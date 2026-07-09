import React from 'react';
import { useProfilePresenter } from '@/hooks/profile/useProfilePresenter';
import { sectionItemVariants } from '@/pages/profile/ProfilePage';
import { Loader2, Unlink, RefreshCw, Youtube, Link2Icon } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfileConnection = () => {
  const {
    isConnectingYouTube,
    isDisconnectingYouTube,
    youtubeStatusMessage,
    isYoutubeConnected,
    youtubeChannelInfo,
    isLoading,

    handleConnectYouTubeAccount,
    handleDisconnectYouTubeAccount,
  } = useProfilePresenter();
  return (
    <>
      <motion.section
        variants={sectionItemVariants}
        className="bg-slate-100 shadow-xl rounded-xl p-6 md:p-8"
        aria-labelledby="connections-heading"
      >
        <h1
          id="connections-heading"
          className="text-xl md:text-2xl font-bold text-slate-800 mb-5 flex items-center"
        >
          <Link2Icon size={24} className="mr-3 text-cyan-600" />
          Akun Terhubung
        </h1>

        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-slate-700 flex items-center">
              <Youtube size={20} className="text-red-500 mr-2" />
              Akun YouTube
            </h2>
            {(isConnectingYouTube || isDisconnectingYouTube) && (
              <Loader2 size={20} className="animate-spin text-sky-500" />
            )}
          </div>

          {/* Menampilkan pesan status operasi YouTube */}
          {youtubeStatusMessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm mb-3 p-2.5 rounded-md border ${
                isYoutubeConnected &&
                (youtubeStatusMessage.toLowerCase().includes('berhasil') ||
                  youtubeStatusMessage.toLowerCase().includes('terhubung'))
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : youtubeStatusMessage.toLowerCase().includes('gagal') ||
                      youtubeStatusMessage.toLowerCase().includes('error')
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-blue-50 text-blue-700 border-blue-300'
              }`}
            >
              {youtubeStatusMessage}
            </motion.p>
          )}

          {/* Menampilkan info channel jika terhubung */}
          {isYoutubeConnected && youtubeChannelInfo && (
            <div className="flex items-center mb-4 p-3 bg-sky-100/70 rounded-md border border-sky-300 shadow-sm">
              {youtubeChannelInfo.thumbnailUrl && (
                <img
                  src={youtubeChannelInfo.thumbnailUrl}
                  alt="Thumbnail Channel YouTube"
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {youtubeChannelInfo.name || 'Nama Channel Tidak Diketahui'}
                </p>
                <p className="text-xs text-green-600 font-medium">Terhubung</p>
              </div>
            </div>
          )}

          {/* Tombol Aksi YouTube */}
          <div className="space-y-3">
            {!isYoutubeConnected ? (
              <motion.button
                onClick={handleConnectYouTubeAccount} // Handler dari presenter
                disabled={isConnectingYouTube || isLoading} // Disable juga saat loading profil umum
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {isConnectingYouTube ? (
                  <Loader2 size={18} className="animate-spin mr-2" />
                ) : (
                  <Link2Icon size={16} className="mr-2" />
                )}
                {isConnectingYouTube ? 'Mengarahkan...' : 'Hubungkan Akun YouTube'}
              </motion.button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                {/* Tombol Perbarui Izin/Sinkronkan Ulang */}
                <motion.button
                  onClick={handleConnectYouTubeAccount} // Panggil fungsi yang sama untuk re-auth dengan prompt:consent
                  disabled={isConnectingYouTube || isDisconnectingYouTube || isLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                  title="Perbarui izin atau sinkronkan ulang koneksi YouTube Anda."
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isConnectingYouTube ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : (
                    <RefreshCw size={16} className="mr-2" />
                  )}
                  {isConnectingYouTube ? 'Memproses...' : 'Perbarui Izin YouTube'}
                </motion.button>

                {/* Tombol Putuskan Hubungan */}
                <motion.button
                  onClick={handleDisconnectYouTubeAccount} // Handler dari presenter
                  disabled={isDisconnectingYouTube || isLoading}
                  className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isDisconnectingYouTube ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : (
                    <Unlink size={16} className="mr-2" />
                  )}
                  {isDisconnectingYouTube ? 'Memutuskan...' : 'Putuskan Hubungan YouTube'}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </>
  );
};
