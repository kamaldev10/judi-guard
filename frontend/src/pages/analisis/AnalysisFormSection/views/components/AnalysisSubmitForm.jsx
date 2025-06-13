/* eslint-disable react/prop-types */
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
  // Komponen untuk ikon "Play" (Mulai Analisis)
  const PlayIcon = ({ className }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.54 0 3.288L7.28 20.99c-1.25.722-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  );

  // Komponen untuk ikon "Loading Spinner"
  const LoadingSpinner = ({ className }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

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
      <div className="space-y-3 sm:space-y-6">
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

        <div className="flex items-center w-full sm:w-1/3 px-2 py-1 sm:py-2 bg-[#A5E8E2] border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition">
          <label
            htmlFor="commentSource"
            className="text-teal-700 font-bold mr-1 sm:mr-3 whitespace-nowrap text-sm sm:text-base"
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
            className={`
              inline-flex items-center justify-center 
               sm:w-auto px-3 sm:px-6 py-2  bg-teal-600 text-white font-semibold rounded-xl shadow-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500  disabled:cursor-not-allowed
              transition-all duration-300 ease-in-out
            `}
            aria-label="Mulai Analisis"
          >
            {isActionInProgress ? (
              // State Loading: Ikon spinner dan teks responsif
              <>
                <LoadingSpinner className="w-5 h-5" />
                <span className="ml-2">Memproses...</span>
              </>
            ) : (
              // State Default: Ikon play dan teks responsif
              <>
                <PlayIcon className="w-5 h-5" />
                <span className=" ml-2">Mulai Analisis</span>
              </>
            )}
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
