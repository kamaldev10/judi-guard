// src/pages/UserProfilePage.jsx
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
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import Swal from "sweetalert2"; // Pastikan sudah diimpor jika Anda memanggilnya dari View
import PropTypes from "prop-types";

import { useProfilePresenter } from "../../hooks/profile/useProfilePresenter"; // Sesuaikan path jika perlu

// Komponen InfoItem (valueClassName default sudah cocok untuk tema terang)
const InfoItem = ({
  icon,
  label,
  value,
  valueClassName = "text-slate-700 font-medium", // Warna teks nilai default untuk tema terang
  delay = 0,
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ type: "spring", stiffness: 100, delay }}
    className="flex items-start p-3 sm:p-3.5 bg-sky-50 hover:bg-sky-100 transition-colors duration-200 rounded-lg shadow-sm border border-sky-200" // Background lebih terang
  >
    <div className="mr-3 sm:mr-4 mt-1 flex-shrink-0" aria-hidden="true">
      {icon}{" "}
      {/* Ikon akan mewarisi warna dari parent atau diberi warna spesifik saat digunakan */}
    </div>
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-sm break-all ${valueClassName}`}>{value}</p>
    </div>
  </motion.div>
);

InfoItem.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  valueClassName: PropTypes.string,
  delay: PropTypes.number,
};

// Varian animasi bisa tetap sama
const pageVariants = {
  hidden: { opacity: 0, y: 20 }, // Sedikit animasi y untuk masuk
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
  const {
    user,
    isLoading,
    fetchError,
    isDeleting,

    handleEditProfile,
    executeDeleteAccount, // executeDeleteAccount akan dipanggil langsung

    isYoutubeConnected,
    youtubeChannelInfo, // Asumsi ini adalah objek { name, thumbnailUrl } atau null

    isConnectingYouTube,
    isDisconnectingYouTube,

    youtubeStatusMessage,

    handleConnectYouTubeAccount,
    handleDisconnectYouTubeAccount,
  } = useProfilePresenter();

  const confirmDeleteAccountHandlerInView = () => {
    if (isDeleting) return;
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
        executeDeleteAccount();
      }
    });
  };

  if (isLoading && !user) {
    return (
      <div
        className="bg-[#d8f6ff] flex flex-col items-center justify-center text-center" // Background utama halaman
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <Loader2 size={48} className="text-sky-600 animate-spin" />
        <p className="mt-3 text-sky-700 font-medium">Memuat profil Anda...</p>
      </div>
    );
  }

  if (fetchError && !user) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center p-4 text-center" // Background utama halaman
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
            {fetchError.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md text-sm"
          >
            Coba Lagi
          </button>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center" // Background utama halaman
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <p className="text-slate-600 text-lg">
          Data pengguna tidak tersedia atau Anda belum login.
        </p>
      </div>
    );
  }

  const { username, email, isVerified, createdAt } = user;
  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-[#d8f6ff] text-slate-800 p-4 sm:p-6 md:p-8 flex flex-col items-center overflow-y-auto selection:bg-sky-200 selection:text-sky-900">
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl space-y-6 md:space-y-8"
      >
        {/* BAGIAN 1: HEADER PROFIL */}
        <motion.section
          variants={sectionItemVariants}
          className="bg-white shadow-xl rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8"
        >
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
              </div>
              {isVerified && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                  className="absolute bottom-1 right-1 bg-green-500 p-2 rounded-full shadow-md border-2 border-white"
                  title="Akun Terverifikasi"
                >
                  <ShieldCheck size={20} className="text-white" />
                </motion.div>
              )}
            </motion.div>
            <motion.h1
              id="profile-heading"
              className="text-3xl md:text-4xl font-bold text-slate-800"
            >
              {username || "Nama Pengguna"}
            </motion.h1>
            <motion.p className="text-sm text-cyan-600 font-medium mt-1">
              Pengguna Terdaftar
            </motion.p>
          </div>

          <div className="flex-1 w-full md:w-auto">
            <div className="space-y-3 mb-6">
              <InfoItem
                icon={<Mail size={18} className="text-cyan-600" />}
                label="Email"
                value={email || "N/A"}
                valueClassName="text-slate-700 font-medium"
              />
              <InfoItem
                icon={<CalendarDays size={18} className="text-cyan-600" />}
                label="Bergabung Sejak"
                value={joinedDate}
                valueClassName="text-slate-700 font-medium"
              />
              {isVerified && (
                <div className="flex items-center p-2.5 bg-green-50 text-green-700 rounded-lg text-xs border border-green-200">
                  <ShieldCheck size={18} className="mr-2 flex-shrink-0" />
                  <p className="font-medium">
                    Akun email ini telah diverifikasi.
                  </p>
                </div>
              )}
            </div>
            <motion.button
              onClick={handleEditProfile}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md hover:shadow-lg transition-colors duration-200 flex items-center justify-center text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
            >
              <Edit3 size={16} className="mr-2" />
              Edit Profil
            </motion.button>
          </div>
        </motion.section>

        {/* BAGIAN 2: KONEKSI AKUN YOUTUBE (Dimodifikasi) */}
        <motion.section
          variants={sectionItemVariants}
          className="bg-white shadow-xl rounded-xl p-6 md:p-8"
          aria-labelledby="connections-heading"
        >
          <h2
            id="connections-heading"
            className="text-xl md:text-2xl font-semibold text-slate-700 mb-5 flex items-center"
          >
            <LinkIcon size={24} className="mr-3 text-cyan-600" />
            Koneksi Akun
          </h2>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
            {" "}
            {/* Tambahkan space-y-4 untuk jarak antar baris grid konseptual */}
            <div className="flex items-center justify-between mb-1">
              {" "}
              {/* Mengurangi margin bottom jika status message akan ada di bawahnya */}
              <h3 className="text-lg font-medium text-slate-700 flex items-center">
                <Youtube size={20} className="text-red-500 mr-2" />
                Akun YouTube
              </h3>
              {(isLoading || isConnectingYouTube || isDisconnectingYouTube) && (
                <Loader2 size={20} className="animate-spin text-sky-500" />
              )}
            </div>
            {/* Grid utama untuk status dan aksi YouTube */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-2 items-center">
              {" "}
              {/* gap-x untuk antar kolom, gap-y jika ada beberapa baris */}
              {/* Baris untuk youtubeStatusMessage (jika ada) - akan span semua kolom */}
              {youtubeStatusMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`col-span-3 text-sm p-2.5 rounded-md border ${
                    isYoutubeConnected &&
                    (youtubeStatusMessage.toLowerCase().includes("berhasil") ||
                      youtubeStatusMessage.toLowerCase().includes("terhubung"))
                      ? "bg-green-50 text-green-700 border-green-300"
                      : youtubeStatusMessage.toLowerCase().includes("gagal")
                        ? "bg-red-50 text-red-700 border-red-300"
                        : "bg-blue-50 text-blue-700 border-blue-300" // Pesan info/loading
                  }`}
                >
                  {youtubeStatusMessage}
                </motion.p>
              )}
              {/* Konten Kondisional: Terhubung atau Belum Terhubung */}
              {isYoutubeConnected && youtubeChannelInfo ? (
                <>
                  {/* Kolom 1: Nama Akun & Thumbnail */}
                  <div className="col-span-3 sm:col-span-1 flex items-center space-x-2 min-w-0 py-1">
                    {" "}
                    {/* min-w-0 untuk truncate */}
                    {youtubeChannelInfo.thumbnailUrl && (
                      <img
                        src={youtubeChannelInfo.thumbnailUrl}
                        alt="Thumbnail Channel"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 border border-slate-200"
                      />
                    )}
                    <p
                      className="text-sm font-semibold text-slate-800 truncate"
                      title={
                        youtubeChannelInfo.name ||
                        "Nama Channel Tidak Diketahui"
                      }
                    >
                      {youtubeChannelInfo.name ||
                        "Nama Channel Tidak Diketahui"}
                    </p>
                  </div>

                  {/* Kolom 2: Status "Terhubung" */}
                  <div className="col-span-3 sm:col-span-1 flex items-center justify-start sm:justify-center py-1">
                    <span className="text-xs px-3 py-1 font-medium bg-green-100 text-green-700 rounded-full">
                      Terhubung
                    </span>
                  </div>

                  {/* Kolom 3: Tombol Disconnect */}
                  <div className="col-span-3 sm:col-span-1 flex items-center justify-start sm:justify-end py-1">
                    <motion.button
                      onClick={handleDisconnectYouTubeAccount}
                      disabled={isDisconnectingYouTube}
                      className="bg-slate-500 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-md shadow-sm flex items-center justify-center text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                      title="Putuskan Hubungan YouTube"
                    >
                      {isDisconnectingYouTube ? (
                        <Loader2 size={16} className="animate-spin sm:mr-1.5" />
                      ) : (
                        <Unlink size={16} className="sm:mr-1.5" />
                      )}
                      <span className="hidden sm:inline">
                        {" "}
                        {/* Teks hanya tampil di layar sm ke atas */}
                        {isDisconnectingYouTube ? "Memutuskan..." : "Putuskan"}
                      </span>
                    </motion.button>
                  </div>
                </>
              ) : (
                // Jika Belum Terhubung: Tombol Hubungkan span semua kolom
                <div className="col-span-3 py-1">
                  <motion.button
                    onClick={handleConnectYouTubeAccount}
                    disabled={isConnectingYouTube}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
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
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* BAGIAN 3: PENGATURAN AKUN & ZONA BERBAHAYA */}
        <motion.section
          variants={sectionItemVariants}
          className="bg-white shadow-xl rounded-xl p-6 md:p-8"
          aria-labelledby="account-settings-heading"
        >
          <h2
            id="account-settings-heading"
            className="text-xl md:text-2xl font-semibold text-slate-700 mb-5"
          >
            Pengaturan Akun
          </h2>
          <div className="mt-6 border-t border-rose-300 pt-6">
            <h3 className="text-lg font-medium text-rose-600 mb-2">
              Zona Berbahaya
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Tindakan menghapus akun bersifat permanen dan tidak dapat
              diurungkan.
            </p>
            <motion.button
              onClick={confirmDeleteAccountHandlerInView}
              disabled={isDeleting}
              className="w-full md:w-auto bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 px-6 rounded-md shadow-md flex items-center justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
            >
              {isDeleting ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Trash2 size={16} className="mr-2" />
              )}
              {isDeleting ? "Memproses..." : "Hapus Akun Saya"}
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
