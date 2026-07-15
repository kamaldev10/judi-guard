import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserProfileQuery } from '../hooks/useProfileQueries.js';
import ProfileHeader from '../components/ProfileHeader.jsx';
import ProfileConnection from '../components/ProfileConnection.jsx';
import ProfileSetting from '../components/ProfileSetting.jsx';
import { Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: user, isLoading, error } = useUserProfileQuery();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const linked = queryParams.get('youtube_linked');
    if (linked) {
      const errorMsgParam = queryParams.get('error');
      const successMsgParam = queryParams.get('message');
      if (linked === 'true') {
        toast.success(successMsgParam || 'Akun YouTube berhasil terhubung!');
      } else if (linked === 'false') {
        const decodedErrorMsg = errorMsgParam
          ? decodeURIComponent(errorMsgParam)
          : 'Gagal menghubungkan akun YouTube.';
        toast.error(decodedErrorMsg);
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 size={48} className="text-sky-600 animate-spin" />
        <p className="mt-3 text-sky-700 dark:text-sky-400 font-medium">Memuat data profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" role="alert">
        <AlertTriangle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-650 mb-2">Terjadi Kesalahan</h2>
        <p className="text-slate-700 dark:text-gray-300 max-w-md">
          {error.message || 'Gagal mengambil data profil Anda.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Pengguna</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Kelola informasi profil personal Anda serta integrasi dengan akun YouTube.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ProfileHeader user={user} onEditClick={() => navigate('/dashboard/profile/edit')} />
          <ProfileConnection user={user} />
        </div>
        <div>
          <ProfileSetting />
        </div>
      </div>
    </div>
  );
}
