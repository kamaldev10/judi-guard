// File: src/pages/EditProfilePage.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Save,
  XCircle,
  Loader2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { useEditProfilePresenter } from "../../hooks/profile/useEditProfilePresenter";

// Varian animasi (bisa sama seperti contoh sebelumnya atau disesuaikan)
const pageVariants = {
  hidden: { opacity: 0, x: -30 }, // Animasi masuk dari kiri
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
  exit: { opacity: 0, x: 30, transition: { ease: "easeInOut", duration: 0.2 } }, // Animasi keluar ke kanan
};

const inputContainerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const EditProfilePage = () => {
  const {
    formData,
    isLoading,
    isSaving,
    fetchError,
    handleInputChange,
    handleSubmit,
    handleCancel,
  } = useEditProfilePresenter();

  if (isLoading) {
    return (
      <div
        className="bg-[#d8f6ff] flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }} // Sesuaikan tinggi karena header h-18
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
            Gagal Memuat Data
          </h2>
          <p className="text-gray-700 text-xs md:text-sm">
            {fetchError.message}
          </p>
          <button
            onClick={handleCancel} // Menggunakan handleCancel dari presenter
            className="mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Kembali ke Profil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#d8f6ff] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-cyan-200 selection:text-cyan-900 overflow-y-auto"
      style={{
        minHeight: "calc(100vh - 4.5rem)",
        maxHeight: "calc(100vh - 4.5rem)",
      }}
    >
      <motion.div
        key="edit-profile-form" // Tambahkan key untuk animasi exit jika halaman ini bagian dari <AnimatePresence> di router
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white shadow-2xl rounded-xl p-5 md:p-8 w-full max-w-lg" // max-w disesuaikan
      >
        <div className="flex items-center mb-5 md:mb-6">
          <button
            onClick={handleCancel}
            className="p-2 mr-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Kembali ke profil"
            disabled={isSaving}
          >
            <ArrowLeft size={22} className="text-gray-600" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Edit Profil Anda
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {" "}
          {/* space-y sedikit dikurangi */}
          <motion.div variants={inputContainerVariants}>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-gray-400" />{" "}
                {/* ikon diperkecil */}
              </div>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Masukkan username baru"
                required
                disabled={isSaving}
              />
            </div>
          </motion.div>
          <motion.div variants={inputContainerVariants}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />{" "}
                {/* ikon diperkecil */}
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Masukkan email baru"
                required
                disabled={isSaving}
              />
            </div>
          </motion.div>
          {/* Contoh jika ada field 'bio':
          <motion.div variants={inputContainerVariants}>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows="3"
              value={formData.bio || ''}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="Ceritakan tentang diri Anda..."
              disabled={isSaving}
            />
          </motion.div>
          */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-3">
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-5 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm disabled:opacity-60"
              disabled={isSaving}
            >
              <XCircle size={16} className="inline mr-1.5 -mt-0.5" />
              Batal
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{
                scale: 1.03,
                boxShadow: "0px 6px 12px rgba(0, 183, 255, 0.15)",
              }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-5 py-2 rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm disabled:opacity-70 flex items-center justify-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin mr-1.5" />
              ) : (
                <Save size={16} className="mr-1.5" />
              )}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfilePage;
