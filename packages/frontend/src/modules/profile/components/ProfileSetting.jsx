import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Loader2, ChevronRight, KeyRound, Settings, AlertTriangle } from 'lucide-react';
import { useDeleteAccountMutation } from '../hooks/useProfileQueries.js';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProfileSetting() {
  const deleteMutation = useDeleteAccountMutation();
  const navigate = useNavigate();

  const handleProfileDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast.success('Akun Anda telah berhasil dihapus.');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus akun.');
    }
  };

  const confirmDeleteAccountHandlerInView = () => {
    if (deleteMutation.isPending) return;

    Swal.fire({
      title: 'Konfirmasi Hapus Akun',
      text: 'Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat diurungkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Ya, Hapus Akun Saya!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'rounded-xl shadow-lg text-sm' },
    }).then((result) => {
      if (result.isConfirmed) {
        handleProfileDelete();
      }
    });
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-950 border dark:border-gray-850 shadow-sm rounded-xl overflow-hidden"
      aria-labelledby="account-settings-heading"
    >
      <div className="p-6 md:p-8">
        <h1
          id="account-settings-heading"
          className="flex items-center text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-5"
        >
          <Settings size={24} className="mr-3 text-rose-600" />
          Pengaturan Akun
        </h1>

        <div className="rounded-lg space-y-5">
          <Link
            data-cy="change-password-link"
            to="/change-password"
            className="group flex items-center justify-between p-4 border border-slate-200 bg-white hover:bg-slate-50 transition-colors duration-200 cursor-pointer rounded-lg dark:bg-gray-900 dark:border-gray-850 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-4">
              <div className="bg-slate-100 dark:bg-gray-800 p-2 rounded-lg">
                <KeyRound className="text-slate-600 dark:text-gray-300" size={20} />
              </div>
              <div className="text-left">
                <span className="font-semibold text-slate-700 dark:text-gray-200">
                  Ganti Kata Sandi
                </span>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Ubah kata sandi Anda secara berkala untuk keamanan.
                </p>
              </div>
            </div>
            <ChevronRight
              className="text-slate-400 group-hover:text-slate-600 transition-transform duration-200 group-hover:translate-x-1 dark:group-hover:text-gray-300"
              size={20}
            />
          </Link>
        </div>
      </div>

      {/* Zona Berbahaya */}
      <div className="bg-rose-50/50 dark:bg-rose-950/10 border-t border-rose-250 px-6 md:px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-rose-500" size={20} />
          <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400">Zona Berbahaya</h3>
        </div>
        <p className="text-sm text-rose-700 dark:text-rose-300/80 mb-5 w-full text-left">
          Tindakan di bawah ini bersifat permanen dan akan menghapus semua data Anda secara
          permanen. Harap berhati-hati.
        </p>
        <button
          data-cy="delete-my-account-button"
          onClick={confirmDeleteAccountHandlerInView}
          disabled={isDeleting}
          className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm flex items-center justify-center text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none cursor-pointer"
        >
          {isDeleting ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <Trash2 size={16} className="mr-2" />
          )}
          {isDeleting ? 'Menghapus Akun...' : 'Hapus Akun Saya'}
        </button>
      </div>
    </motion.section>
  );
}
