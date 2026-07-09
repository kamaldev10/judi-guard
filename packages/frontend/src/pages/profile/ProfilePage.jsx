import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useProfilePresenter } from '@/hooks/profile/useProfilePresenter';
import PageLoader from '@/components/layout/PageLoader';
import NotLogin from '@/components/status/NotLogin';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileConnection } from '@/components/profile/ProfileConnection';
import { ProfileSetting } from '@/components/profile/ProfileSetting';

// Varian animasi Framer Motion
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.5 },
  },
};

export const sectionItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15, duration: 0.5 },
  },
};

const UserProfilePage = () => {
  const {
    user, // Objek pengguna yang sedang login
    isLoading, // True jika data profil sedang dimuat
    fetchError, // Objek error jika gagal memuat profil
  } = useProfilePresenter();

  const profilePageRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    let timerId;

    if (location.pathname === '/profile' && !isLoading && user && profilePageRef.current) {
      timerId = setTimeout(() => {
        if (profilePageRef.current && profilePageRef.current.scrollIntoView) {
          profilePageRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [location, isLoading, user]);

  if (isLoading && !user && !fetchError) {
    return <PageLoader />;
  }

  // Tampilan jika gagal memuat data profil awal
  if (fetchError && !user) {
    return (
      <div
        className=" bg-[#d8f6ff] flex items-center justify-center p-4 text-center"
        style={{ minHeight: 'calc(100vh - 4.5rem)' }}
        role="alert"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full"
        >
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-red-600 mb-2">
            Oops! Terjadi Kesalahan
          </h2>
          <p className="text-slate-700 text-sm md:text-base">
            {fetchError.message || 'Tidak dapat memuat data profil.'}
          </p>
          <button
            onClick={() => window.location.reload()} // Reload sederhana, atau panggil fungsi fetch ulang dari presenter
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md text-sm"
          >
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <NotLogin />;
  }

  return (
    <div
      className="min-h-[calc(100vh-4.5rem)] scroll-mt-96 bg-[#d8f6ff] text-slate-800 p-4 sm:p-6 md:p-8 flex flex-col items-center overflow-y-auto selection:bg-sky-200 selection:text-sky-900 "
      ref={profilePageRef}
    >
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl space-y-6 md:space-y-8 "
      >
        <ProfileHeader />

        <ProfileConnection />

        <ProfileSetting />
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
