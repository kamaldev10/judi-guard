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
  Image as ImageIcon, // Untuk upload avatar (opsional)
  Lock, // Untuk field password (opsional)
} from "lucide-react";
import { useEditProfilePresenter } from "../../hooks/profile/useEditProfilePresenter"; // Sesuaikan path

// Varian animasi
const pageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { ease: "anticipate", duration: 0.3 },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const EditProfilePage = () => {
  const {
    formData,
    isLoading, // Loading data awal
    isSaving, // Loading saat submit
    fetchError,
    handleInputChange,
    handleSubmit,
    handleCancel, // Fungsi untuk kembali dari presenter
  } = useEditProfilePresenter();

  if (isLoading) {
    return (
      <div
        className="bg-[#d8f6ff] flex flex-col items-center justify-center text-center"
        style={{ minHeight: "calc(100vh - 4.5rem)" }}
      >
        <Loader2 size={48} className="text-sky-600 animate-spin" />
        <p className="mt-3 text-sky-700 font-medium">Memuat data profil...</p>
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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 md:p-8 rounded-xl shadow-2xl max-w-md w-full"
        >
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-red-600 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-slate-700 text-sm md:text-base mb-6">
            {fetchError.message}
          </p>
          <button
            onClick={handleCancel}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors text-sm shadow hover:shadow-md"
          >
            <ArrowLeft size={16} className="inline mr-1.5 -mt-0.5" />
            Kembali ke Profil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="bg-[#d8f6ff] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-sky-200 selection:text-sky-900 overflow-y-auto"
      style={{
        minHeight: "calc(100vh - 4.5rem)", // Sesuaikan dengan tinggi navbar Anda
        // maxHeight: "calc(100vh - 4.5rem)", // Hapus jika form bisa lebih panjang
      }}
    >
      <motion.div
        key="edit-profile-form"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white shadow-2xl rounded-xl p-6 sm:p-8 w-full max-w-lg" // max-w bisa disesuaikan
      >
        <div className="flex items-center mb-6 md:mb-8">
          <button
            onClick={handleCancel}
            className="p-2 mr-3 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            aria-label="Kembali ke profil"
            disabled={isSaving}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Edit Profil Anda
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {/* Input Username */}
          <motion.div variants={formItemVariants}>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-600">
                <User
                  size={18}
                  className="text-slate-400 group-focus-within:text-sky-500"
                />
              </div>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username || ""}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                           transition-shadow sm:text-sm hover:border-slate-400"
                placeholder="Masukkan username baru"
                required
                disabled={isSaving}
              />
            </div>
          </motion.div>

          {/* Input Email */}
          <motion.div variants={formItemVariants}>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail
                  size={18}
                  className="text-slate-400 group-focus-within:text-sky-500"
                />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 
                           focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                           transition-shadow sm:text-sm hover:border-slate-400"
                placeholder="Masukkan email baru"
                required
                disabled={isSaving}
              />
            </div>
          </motion.div>

          {/* Contoh Upload Avatar (Opsional, perlu logika tambahan di presenter & backend) */}
          {/* <motion.div variants={formItemVariants}>
            <label htmlFor="avatar" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Foto Profil (Opsional)
            </label>
            <div className="mt-1 flex items-center space-x-3 p-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-sky-500 transition-colors">
              <span className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                {formData.avatarPreview ? (
                  <img src={formData.avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-slate-400" />
                )}
              </span>
              <input
                type="file"
                name="avatar"
                id="avatar"
                onChange={handleInputChange} // Anda perlu menangani input file di presenter
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4
                           file:rounded-full file:border-0 file:text-sm file:font-semibold
                           file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 disabled:opacity-50"
                accept="image/png, image/jpeg, image/webp"
                disabled={isSaving}
              />
            </div>
          </motion.div> */}

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-4 md:pt-5">
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60"
              disabled={isSaving}
            >
              <XCircle size={16} className="inline mr-1.5 -mt-0.5" />
              Batal
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{
                y: -2,
                boxShadow: "0px 8px 15px rgba(0, 123, 255, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
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
