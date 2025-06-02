// File: src/pages/UserProfilePage.jsx

import React from "react"; // useState & useEffect tidak lagi dominan untuk logika utama
import { motion } from "framer-motion";
import {
  User,
  Mail,
  CalendarDays,
  ShieldCheck,
  Edit3,
  AlertTriangle,
  Trash2,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

import { useUserProfilePresenter } from "../../hooks/profile/useUserProfilePresenter"; // Sesuaikan path

const InfoItem = ({ icon, label, value, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: "spring", stiffness: 100, delay }}
    className="flex items-start p-3 sm:p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors duration-200 rounded-lg shadow-sm border border-slate-200"
  >
    <div className="mr-3 sm:mr-4 mt-1 flex-shrink-0" aria-hidden="true">
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-800 font-medium break-all">{value}</p>
    </div>
  </motion.div>
);

// Varian animasi bisa tetap sama
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }, // Stagger lebih cepat sedikit
};
const sectionItemVariants = {
  // Digunakan untuk blok utama dalam kartu
  hidden: { opacity: 0, y: 15 }, // Pergeseran y lebih kecil
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};
const avatarMotionVariants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.05 },
  },
  hover: { scale: 1.05, rotate: 2, transition: { duration: 0.3 } },
};

const UserProfilePage = () => {
  const {
    user,
    isLoading,
    fetchError,
    isDeleting,
    handleEditProfile,
    executeDeleteAccount, // Gunakan fungsi dari presenter untuk eksekusi
  } = useUserProfilePresenter();

  // Handler di View untuk menampilkan konfirmasi SweetAlert
  const confirmDeleteAccountHandlerInView = () => {
    if (isDeleting) return; // Cegah jika sudah dalam proses

    Swal.fire({
      title: "Konfirmasi Hapus Akun",
      text: "Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat diurungkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus Akun Saya!",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-xl shadow-lg text-sm" },
    }).then((result) => {
      if (result.isConfirmed) {
        // Jika dikonfirmasi oleh pengguna, panggil fungsi presenter untuk eksekusi
        executeDeleteAccount();
      }
    });
  };

  // Tampilan loading awal, error fetch awal, dan jika user belum ada
  // (sama seperti sebelumnya, dengan penyesuaian tinggi karena header h-18)
  if (isLoading) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <Loader2 size={40} className="text-cyan-600 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center p-4 text-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
        role="alert"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full"
        >
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-lg md:text-xl font-semibold text-red-600 mb-2">
            Oops! Terjadi Kesalahan
          </h2>
          <p className="text-gray-700 text-xs md:text-sm">
            {fetchError.message}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <p className="text-gray-600">Data pengguna tidak tersedia.</p>
      </div>
    );
  }

  const { username, email, isVerified, createdAt } = user;
  const joinedDate = new Date(createdAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div
        className="bg-[#d8f6ff] flex items-center justify-center p-4 sm:p-6 selection:bg-cyan-200 selection:text-cyan-900 overflow-y-auto"
        style={{
          minHeight: "calc(100vh - 4.5rem)",
          maxHeight: "calc(100vh - 4.5rem)",
        }}
      >
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="bg-white shadow-2xl rounded-xl p-5 md:p-6 w-full max-w-md sm:max-w-lg"
          aria-labelledby="profile-heading"
        >
          {/* ... Bagian Header Profil (username, avatar, dll) sama seperti sebelumnya ... */}
          <motion.section
            variants={sectionItemVariants}
            className="flex flex-col items-center text-center mb-6 md:mb-8"
          >
            <motion.div
              variants={avatarMotionVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="relative mb-3"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg ring-2 md:ring-4 ring-white ring-offset-2 ring-offset-[#d8f6ff]">
                <User size={60} strokeWidth={1.5} aria-hidden="true" />
              </div>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full shadow-md border-2 border-white"
                  title="Akun Terverifikasi"
                >
                  <ShieldCheck
                    size={16}
                    className="text-white"
                    aria-label="Akun Terverifikasi"
                  />
                </motion.div>
              )}
            </motion.div>
            <motion.h1
              id="profile-heading"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1, type: "spring" },
              }}
              className="text-2xl md:text-3xl font-bold text-gray-800"
            >
              {username}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.15, type: "spring" },
              }}
              className="text-xs md:text-sm text-cyan-600 font-medium mt-1"
            >
              Pengguna Terdaftar
            </motion.p>
          </motion.section>

          {/* ... Bagian Detail Profil (InfoItem) sama seperti sebelumnya ... */}
          <motion.section
            variants={sectionItemVariants}
            className="space-y-3 md:space-y-4"
            aria-labelledby="profile-details-heading"
          >
            <h2 id="profile-details-heading" className="sr-only">
              Detail Profil
            </h2>
            <InfoItem
              icon={<Mail size={18} className="text-cyan-600" />}
              label="Email"
              value={email}
              delay={0.1}
            />
            <InfoItem
              icon={<CalendarDays size={18} className="text-cyan-600" />}
              label="Bergabung Sejak"
              value={joinedDate}
              delay={0.15}
            />
            {isVerified && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.2, type: "spring" },
                }}
                className="flex items-center p-2.5 bg-green-50 text-green-700 rounded-lg shadow-sm border border-green-200 text-xs"
                role="status"
              >
                <ShieldCheck
                  size={18}
                  className="mr-2 flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="font-medium">Akun ini telah diverifikasi.</p>
              </motion.div>
            )}
          </motion.section>

          {/* Tombol Aksi */}
          <motion.section
            variants={sectionItemVariants}
            className="mt-6 md:mt-8 space-y-3 md:space-y-0 md:flex md:items-center md:justify-center md:space-x-3"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEditProfile}
              className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              aria-label="Edit Profil Pengguna"
            >
              <Edit3 size={16} className="mr-1.5" />
              Edit Profil
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={confirmDeleteAccountHandlerInView} // Panggil handler View untuk konfirmasi
              disabled={isDeleting}
              className="w-full md:w-auto bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-70 text-sm"
              aria-label="Hapus Akun Pengguna"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin mr-1.5" />
              ) : (
                <Trash2 size={16} className="mr-1.5" />
              )}
              {isDeleting ? "Memproses..." : "Hapus Akun"}
            </motion.button>
          </motion.section>
        </motion.div>
      </div>
    </>
  );
};

export default UserProfilePage;

InfoItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

InfoItem.defaultProps = {
  delay: 0,
};
