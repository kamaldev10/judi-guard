// src/pages/UserProfilePage.jsx
import React, { useEffect, useRef } from "react"; // Impor React (opsional di versi React >17 jika JSX dipakai, tapi baik untuk kejelasan)
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
  Youtube,
  Link as LinkIcon, // Menggunakan alias untuk menghindari konflik nama jika ada
  Unlink,
  RefreshCw, // Ikon untuk "Perbarui Izin" atau "Sinkronkan Ulang"
  ChevronRight,
  KeyRound,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2"; // Digunakan untuk konfirmasi hapus akun
import PropTypes from "prop-types";

import { useProfilePresenter } from "../../hooks/profile/useProfilePresenter"; // Pastikan path ini benar
import { Link, useLocation } from "react-router-dom";
import { NotLogin } from "@/assets/images";

// Komponen InfoItem untuk menampilkan item informasi profil
const InfoItem = ({
  icon,
  label,
  value,
  valueClassName = "text-slate-700 font-medium",
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: "spring", stiffness: 100, delay }}
    className="flex items-start p-3 sm:p-3.5 bg-sky-50 hover:bg-sky-100 transition-colors duration-200 rounded-lg shadow-sm border border-sky-200"
  >
    <div
      className="mr-3 sm:mr-4 mt-1 flex-shrink-0 text-cyan-600"
      aria-hidden="true"
    >
      {" "}
      {/* Memberi warna default pada ikon wrapper */}
      {React.cloneElement(icon, { size: 18 })}{" "}
      {/* Mengatur ukuran ikon secara konsisten */}
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm break-all ${valueClassName}`}>
        {value || "N/A"}
      </p>{" "}
      {/* Fallback untuk value */}
    </div>
  </motion.div>
);

InfoItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string, // Diubah menjadi tidak required, dengan fallback di atas
  valueClassName: PropTypes.string,
  delay: PropTypes.number,
};

// Varian animasi Framer Motion
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.5 },
  },
};
const sectionItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15, duration: 0.5 },
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
  // Mengambil state dan handler dari custom hook presenter
  const {
    user, // Objek pengguna yang sedang login
    isLoading, // True jika data profil sedang dimuat
    fetchError, // Objek error jika gagal memuat profil
    isDeleting, // True jika proses hapus akun sedang berjalan

    handleEditProfile, // Fungsi untuk navigasi ke halaman edit profil
    executeDeleteAccount, // Fungsi untuk memulai proses hapus akun (setelah konfirmasi)

    isYoutubeConnected, // Boolean, true jika akun YouTube terhubung
    youtubeChannelInfo, // Objek info channel YouTube (misal { name, thumbnailUrl }) atau null

    isConnectingYouTube, // True saat proses redirect ke Google untuk koneksi/update izin YouTube
    isDisconnectingYouTube, // True saat proses memutuskan koneksi YouTube

    youtubeStatusMessage, // Pesan status terkait operasi YouTube

    handleConnectYouTubeAccount, // Fungsi untuk memulai koneksi atau memperbarui izin YouTube
    handleDisconnectYouTubeAccount, // Fungsi untuk memutuskan koneksi YouTube
  } = useProfilePresenter();

  const profilePageRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (
      location.pathname === "/profile" &&
      !isLoading &&
      user &&
      profilePageRef.current
    ) {
      setTimeout(() => {
        profilePageRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location, isLoading, user]);
  // Handler konfirmasi hapus akun di View (memanggil executeDeleteAccount dari presenter)
  const confirmDeleteAccountHandlerInView = () => {
    if (isDeleting) return; // Mencegah klik ganda

    Swal.fire({
      title: "Konfirmasi Hapus Akun",
      text: "Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat diurungkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e53e3e", // Merah untuk delete
      cancelButtonColor: "#718096", // Abu-abu
      confirmButtonText: "Ya, Hapus Akun Saya!",
      cancelButtonText: "Batal",
      customClass: { popup: "rounded-xl shadow-lg text-sm" },
    }).then((result) => {
      if (result.isConfirmed) {
        executeDeleteAccount(); // Panggil fungsi dari presenter
      }
    });
  };

  // Tampilan saat data profil sedang dimuat
  if (isLoading && !user && !fetchError) {
    // Kondisi lebih spesifik untuk loading awal
    return (
      <div
        className="bg-[#d8f6ff] flex flex-col items-center justify-center text-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }} // Sesuaikan '4.5rem' dengan tinggi header Anda
      >
        <Loader2 size={48} className="text-sky-600 animate-spin" />
        <p className="mt-3 text-sky-700 font-medium">Memuat profil Anda...</p>
      </div>
    );
  }

  // Tampilan jika gagal memuat data profil awal
  if (fetchError && !user) {
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
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-red-600 mb-2">
            Oops! Terjadi Kesalahan
          </h2>
          <p className="text-slate-700 text-sm md:text-base">
            {fetchError.message || "Tidak dapat memuat data profil."}
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

  // Tampilan jika user tidak ada (misalnya, setelah logout atau jika fetch gagal tapi tidak ada error eksplisit)
  if (!user) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <div className="container mx-auto p-4 text-center space-y-6">
          <img
            src={NotLogin}
            alt="Not Logged In Image"
            className="h-80 items-center mx-auto mb-4"
          />
          <p className="text-slate-600 text-lg">
            Data pengguna tidak tersedia. Silahkan Login terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }

  // Format tanggal bergabung pengguna
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div
      className="min-h-[calc(100vh-4.5rem)] scroll-mt-96 bg-[#d8f6ff] text-slate-800 p-4 sm:p-6 md:p-8 flex flex-col items-center overflow-y-auto selection:bg-sky-200 selection:text-sky-900 "
      ref={profilePageRef}
    >
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl space-y-6 md:space-y-8 " // Max width untuk konten utama
      >
        {/* BAGIAN 1: HEADER PROFIL (Avatar, Nama, Info Dasar) */}
        <motion.section
          variants={sectionItemVariants}
          className=" bg-white shadow-xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8"
        >
          {/* Avatar dan Nama */}
          <div className="flex-shrink-0 flex flex-col items-center text-center md:text-left">
            <motion.div
              variants={avatarMotionVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="relative mb-3 md:mb-4"
            >
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white ring-offset-4 ring-offset-[#d8f6ff]">
                <User size={80} strokeWidth={1.2} />
                {/* <img
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full "
                  src={AliImage}
                /> */}
              </div>
              {user.isVerified && (
                <motion.div
                  // ... props animasi ...
                  className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full shadow-md border-2 border-white"
                  title="Akun Terverifikasi"
                >
                  <ShieldCheck size={20} className="text-white" />
                </motion.div>
              )}
            </motion.div>
            <motion.h1
              id="profile-heading" // Untuk aksesibilitas
              className="text-3xl md:text-4xl font-bold text-slate-800"
            >
              {user.username || "Nama Pengguna"}
            </motion.h1>
            <motion.p className="text-sm text-cyan-600 font-medium mt-1">
              Pengguna Terdaftar
            </motion.p>
          </div>

          {/* Info Detail dan Tombol Edit */}
          <div className="flex-1 w-full md:w-auto">
            <div className="space-y-3 mb-6">
              <InfoItem
                icon={<Mail className="text-cyan-600" />} // Beri warna pada ikon secara eksplisit
                label="Email"
                value={user.email}
                delay={0.1}
              />
              <InfoItem
                icon={<CalendarDays className="text-cyan-600" />}
                label="Bergabung Sejak"
                value={joinedDate}
                delay={0.2}
              />
              {user.isVerified && (
                <motion.div
                  variants={sectionItemVariants} // Gunakan varian yang sama atau baru
                  className="flex items-center p-2.5 bg-green-50 text-green-700 rounded-lg text-xs border border-green-200"
                >
                  <ShieldCheck size={18} className="mr-2 flex-shrink-0" />
                  <p className="font-medium">
                    Akun email ini telah diverifikasi.
                  </p>
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={handleEditProfile} // Handler dari presenter
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md hover:shadow-lg transition-colors duration-200 flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Edit3 size={16} className="mr-2" />
              Edit Profil
            </motion.button>
          </div>
        </motion.section>

        {/* BAGIAN 2: KONEKSI AKUN YOUTUBE */}
        <motion.section
          variants={sectionItemVariants}
          className="bg-white shadow-xl rounded-xl p-6 md:p-8"
          aria-labelledby="connections-heading"
        >
          <h2
            id="connections-heading"
            className="text-xl md:text-2xl font-bold text-slate-800 mb-5 flex items-center"
          >
            <LinkIcon size={24} className="mr-3 text-cyan-600" />
            Koneksi Akun
          </h2>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-slate-700 flex items-center">
                <Youtube size={20} className="text-red-500 mr-2" />
                Akun YouTube
              </h3>
              {/* Indikator loading spesifik untuk operasi YouTube */}
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
                  (youtubeStatusMessage.toLowerCase().includes("berhasil") ||
                    youtubeStatusMessage.toLowerCase().includes("terhubung"))
                    ? "bg-green-50 text-green-700 border-green-300"
                    : youtubeStatusMessage.toLowerCase().includes("gagal") ||
                        youtubeStatusMessage.toLowerCase().includes("error")
                      ? "bg-red-50 text-red-700 border-red-300"
                      : "bg-blue-50 text-blue-700 border-blue-300" // Untuk pesan info/mengarahkan
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
                    {youtubeChannelInfo.name || "Nama Channel Tidak Diketahui"}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Terhubung
                  </p>
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
                    <LinkIcon size={16} className="mr-2" />
                  )}
                  {isConnectingYouTube
                    ? "Mengarahkan..."
                    : "Hubungkan Akun YouTube"}
                </motion.button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                  {/* Tombol Perbarui Izin/Sinkronkan Ulang */}
                  <motion.button
                    onClick={handleConnectYouTubeAccount} // Panggil fungsi yang sama untuk re-auth dengan prompt:consent
                    disabled={
                      isConnectingYouTube || isDisconnectingYouTube || isLoading
                    }
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
                    {isConnectingYouTube
                      ? "Memproses..."
                      : "Perbarui Izin YouTube"}
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
                    {isDisconnectingYouTube
                      ? "Memutuskan..."
                      : "Putuskan Hubungan YouTube"}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* BAGIAN 3: PENGATURAN AKUN & ZONA BERBAHAYA - DESAIN BARU */}
        <motion.section
          variants={sectionItemVariants}
          className="bg-white shadow-xl rounded-xl overflow-hidden"
          aria-labelledby="account-settings-heading"
        >
          <div className="p-6 md:p-8">
            <h2
              id="account-settings-heading"
              className="flex items-center text-xl md:text-2xl font-bold text-slate-800 mb-5"
            >
              <Settings size={24} className="mr-3 text-rose-600" />
              Pengaturan Akun
            </h2>

            {/* Daftar Aksi Pengaturan */}
            <div className="border border-slate-200 rounded-lg">
              <Link
                to="/change-password"
                className="group flex items-center justify-between p-4  bg-slate-50 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <KeyRound className="text-slate-600" size={20} />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Ganti Kata Sandi
                    </span>
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
              <h3 className="text-lg font-bold text-rose-800">
                Zona Berbahaya
              </h3>
            </div>
            <p className="text-sm text-rose-700 mb-5 w-full">
              Tindakan di bawah ini bersifat permanen dan akan menghapus semua
              data Anda secara permanen. Harap berhati-hati.
            </p>
            <motion.button
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
              {isDeleting ? "Menghapus Akun..." : "Hapus Akun Saya"}
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
