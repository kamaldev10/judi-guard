import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { User, Mail, Save, XCircle, Loader2, ArrowLeft } from 'lucide-react';

// Varian animasi sekarang menjadi milik komponen ini
const pageVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { ease: 'anticipate', duration: 0.3 },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const EditProfileForm = ({ formData, isSaving, onSubmit, onInputChange, onCancel }) => {
  return (
    <motion.div
      key="edit-profile-form"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white shadow-2xl rounded-xl p-6 sm:p-8 w-full max-w-lg"
    >
      <div className="flex items-center mb-6 md:mb-8">
        <button
          onClick={onCancel}
          className="p-2 mr-3 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          aria-label="Kembali ke profil"
          disabled={isSaving}
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Edit Profil Anda</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 md:space-y-6">
        {/* Input Email */}
        <motion.div variants={formItemVariants}>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail size={18} className="text-slate-400 group-focus-within:text-sky-500" />
            </div>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={onInputChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                         transition-shadow sm:text-sm hover:border-slate-400"
              placeholder="Masukkan email baru"
              required
              disabled // Email (biasanya) tidak bisa diubah
            />
          </div>
        </motion.div>

        {/* Input Username */}
        <motion.div variants={formItemVariants}>
          <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Username
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-600">
              <User size={18} className="text-slate-400 group-focus-within:text-sky-500" />
            </div>
            <input
              data-cy="username-input"
              type="text"
              name="username"
              id="username"
              value={formData.username || ''}
              onChange={onInputChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 
                         transition-shadow sm:text-sm hover:border-slate-400"
              placeholder="Masukkan username baru"
              required
              disabled={isSaving}
            />
          </div>
        </motion.div>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0 pt-4 md:pt-5">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto order-2 sm:order-1 px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60"
            disabled={isSaving}
          >
            <XCircle size={16} className="inline mr-1.5 -mt-0.5" />
            Batal
          </motion.button>
          <motion.button
            data-cy="save-profile-button"
            type="submit"
            whileHover={{
              y: -2,
              boxShadow: '0px 8px 15px rgba(0, 123, 255, 0.2)',
            }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto order-1 sm:order-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-linear-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// PropTypes sangat penting untuk komponen "bodoh"
EditProfileForm.propTypes = {
  formData: PropTypes.shape({
    email: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  isSaving: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EditProfileForm;
