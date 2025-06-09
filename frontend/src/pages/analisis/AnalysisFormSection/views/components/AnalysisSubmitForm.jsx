// src/features/video-analysis/views/components/AnalysisSubmitForm.jsx
import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Youtube } from "lucide-react";

/**
 * Form untuk mengirimkan URL video YouTube untuk dianalisis.
 * @param {object} props - Props yang diterima dari komponen induk.
 * @param {string} props.videoUrl - Nilai input URL video.
 * @param {Function} props.setVideoUrl - Fungsi untuk mengubah nilai videoUrl.
 * @param {Function} props.onSubmit - Fungsi yang dipanggil saat tombol analisis diklik.
 * @param {boolean} props.isActionInProgress - Status apakah ada aksi yang sedang berjalan.
 * @param {string|null} props.loadingMessage - Pesan yang ditampilkan saat loading.
 */
const AnalysisSubmitForm = ({
  videoUrl,
  setVideoUrl,
  onSubmit,
  isActionInProgress,
  loadingMessage,
}) => {
  return (
    <motion.section
      id="analysis-form"
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 md:p-8 w-full max-w-4xl mx-auto"
    >
      <h2 className="text-center text-xl md:text-2xl font-bold text-teal-700 mb-6">
        Analisis Komentar Video YouTube
      </h2>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="videoUrl"
            className="block text-teal-700 font-semibold mb-1.5"
          >
            Link Video :
          </label>
          <input
            id="videoUrl"
            type="text"
            value={videoUrl}
            autoComplete="on"
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Tempelkan link video YouTube di sini"
            className="w-full border border-gray-500 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow shadow-sm"
            disabled={isActionInProgress}
          />
        </div>

        <div className="flex items-center w-1/3 px-2 py-2 bg-[#A5E8E2] border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
          <label
            htmlFor="commentSource"
            className="text-teal-700 font-bold mr-3 whitespace-nowrap"
          >
            Sumber Komentar :
          </label>
          <select
            id="commentSource"
            // value={source}
            // onChange={(e) => setSource(e.target.value)}
            className="w-full bg-[#A5E8E2] text-teal-700 font-semibold text-md px-1 py-1"
            disabled={isActionInProgress}
            defaultValue="Youtube" // Gunakan defaultValue untuk placeholder di React
          >
            <option value="youtube">YouTube</option>
            <option disabled>Other is Upcoming </option>
            {/* <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option> */}
          </select>
        </div>

        {/* == AKHIR BLOK DROPDOWN BARU == */}

        <div className="text-center pt-2 justify-end flex">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isActionInProgress || !videoUrl.trim()}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 font-semibold disabled:opacity-60 shadow-md hover:shadow-lg "
          >
            {isActionInProgress ? "Sedang Memproses..." : "Mulai Analisis"}
          </button>
        </div>
      </div>

      {loadingMessage && (
        <p className="text-teal-600 text-sm mt-4 text-center animate-pulse">
          {loadingMessage}
        </p>
      )}
    </motion.section>
  );
};

AnalysisSubmitForm.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  setVideoUrl: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isActionInProgress: PropTypes.bool.isRequired,
  loadingMessage: PropTypes.string,
};

export default AnalysisSubmitForm;
