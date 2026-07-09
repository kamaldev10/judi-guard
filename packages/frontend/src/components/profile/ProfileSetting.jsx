import React from 'react';
import { sectionItemVariants } from '@/pages/profile/ProfilePage';
import { Link } from 'react-router-dom';
import { Trash2, Loader2, ChevronRight, KeyRound, Settings, AlertTriangle } from 'lucide-react';
import { useProfilePresenter } from '@/hooks/profile/useProfilePresenter';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

export const ProfileSetting = () => {
  const { isDeleting, executeDeleteAccount } = useProfilePresenter();

  const confirmDeleteAccountHandlerInView = () => {
    if (isDeleting) return;

    Swal.fire({
      title: 'Konfirmasi Hapus Akun',
      text: 'Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat diurungkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e', // Merah untuk delete
      cancelButtonColor: '#718096', // Abu-abu
      confirmButtonText: 'Ya, Hapus Akun Saya!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-xl shadow-lg text-sm' },
    }).then((result) => {
      if (result.isConfirmed) {
        executeDeleteAccount();
      }
    });
  };

  return (
    <>
      <motion.section
        variants={sectionItemVariants}
        className="bg-slate-100 shadow-xl rounded-xl overflow-hidden"
        aria-labelledby="account-settings-heading"
      >
        <div className="p-6 md:p-8">
          <h1
            id="account-settings-heading"
            className="flex items-center text-xl md:text-2xl font-bold text-slate-800 mb-5"
          >
            <Settings size={24} className="mr-3 text-rose-600" />
            Pengaturan Akun
          </h1>

          {/* Daftar Aksi Pengaturan */}
          <div className=" rounded-lg space-y-5">
            <Link
              data-cy="change-password-link"
              to="/change-password"
              className="group flex items-center justify-between p-4 border border-slate-200 bg-white hover:bg-slate-300 transition-colors duration-200 cursor-pointer rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <KeyRound className="text-slate-600" size={20} />
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Ganti Kata Sandi</span>
                  <p className="text-sm text-slate-500">
                    Ubah kata sandi Anda secara berkala untuk keamanan.
                  </p>
                </div>
              </div>
              <ChevronRight
                className="text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-hover:translate-x-1"
                size={20}
              />
            </Link>

            {/* Tambahkan item pengaturan lain di sini jika ada */}
          </div>
        </div>

        {/* Zona Berbahaya - Dipisahkan secara visual */}
        <div className="bg-rose-50/50 border-t border-rose-200 px-6 md:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-rose-500" size={20} />
            <h3 className="text-lg font-bold text-rose-800">Zona Berbahaya</h3>
          </div>
          <p className="text-sm text-rose-700 mb-5 w-full">
            Tindakan di bawah ini bersifat permanen dan akan menghapus semua data Anda secara
            permanen. Harap berhati-hati.
          </p>
          <motion.button
            data-cy="delete-my-account-button"
            onClick={confirmDeleteAccountHandlerInView}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-rose-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm flex items-center justify-center text-sm transition-all duration-200 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-rose-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDeleting ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Trash2 size={16} className="mr-2" />
            )}
            {isDeleting ? 'Menghapus Akun...' : 'Hapus Akun Saya'}
          </motion.button>
        </div>
      </motion.section>
    </>
  );
};
