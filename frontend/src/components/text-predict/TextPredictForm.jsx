import React, { useState } from "react";
import { useTextPredict } from "../../hooks/text-predict/useTextPredict"; // Sesuaikan path
import { motion, AnimatePresence } from "framer-motion";

// Ikon untuk tombol submit (magnifying glass)
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

// Komponen Ikon untuk loading
const LoadingSpinner = () => (
  <svg
    className="w-5 h-5 text-white animate-spin"
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

const TextPredictForm = () => {
  const [inputText, setInputText] = useState("");
  const { prediction, isLoading, error, analyze } = useTextPredict();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    analyze(inputText);
  };

  return (
    // Section ini sekarang menjadi card mandiri
    <motion.section
      className="min-h-[50vh] w-full p-8 bg-[#B9E6FD] sm:bg-teal-50 rounded-none sm:rounded-2xl shadow-none sm:shadow-lg border-0 sm:border-1 border-gray-200"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      <div className="sr-only sm:not-sr-only text-center">
        <h2 className="text-xl font-bold text-teal-700 sm:text-2xl">
          Analisis Kalimat Otomatis
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-gray-600">
          Deteksi potensi konten perjudian secara instan.
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="relative mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Padding kanan (pr) dibuat responsif agar sesuai dengan ukuran tombol */}
        <input
          type="text"
          id="text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-5 py-3 pr-14 sm:pr-32 text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-100 transition"
          placeholder="Masukkan teks di sini..."
          required
          disabled={isLoading}
        />
        {/* Padding div tombol disesuaikan */}
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          {/* Ukuran dan padding tombol dibuat responsif */}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center h-full p-2 text-sm font-semibold text-white bg-teal-700 rounded-full shadow-sm w-10 sm:w-28 sm:px-4 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:bg-teal-500 disabled:cursor-not-allowed transition-all duration-300"
            aria-label="Analisis Teks"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Ikon selalu tampil */}
                <SearchIcon className="w-5 h-5" />
                {/* Teks "Analisis" hanya tampil di layar sm ke atas */}
                <span className="hidden sm:inline sm:ml-2">Analisis</span>
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Area Hasil */}
      <div className="mt-3 sm:mt-6  ">
        <AnimatePresence>
          {!prediction && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="justify-center align-middle mt-3 sm:mt-20 max-h-[150px]"
            >
              <p className="text-xs text-center text-gray-700 sm:text-base py-0 sm:py-10">
                Tidak ada kalimat yang di prediksi
              </p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-24 h-full"
            >
              <p className="text-teal-600">Menganalisis dengan model AI...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 font-semibold text-center text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              Error: {error}
            </motion.div>
          )}

          {/* Kartu Hasil dengan layout kolom yang responsif */}
          {prediction && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 md:mt-10 md:py-10 bg-slate-50 rounded-xl border border-slate-200"
            >
              <h3 className="text-lg font-bold mb-10 text-center text-teal-800 ">
                Hasil Prediksi
              </h3>

              <div className="flex flex-col w-full gap-3 mt-4 sm:flex-row">
                {/* Kolom Klasifikasi */}
                <div className="flex-1 p-3 text-center bg-white rounded-lg shadow-sm ">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Klasifikasi
                  </span>
                  <p
                    className={`mt-1 text-xl sm:text-2xl font-extrabold ${
                      prediction.classification === "JUDI"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {prediction.classification}
                  </p>
                </div>

                {/* Kolom Skor Kepercayaan */}
                <div className="flex-1 p-3 text-center bg-white rounded-lg shadow-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kepercayaan
                  </span>
                  <p className="mt-1 text-xl sm:text-2xl font-extrabold text-teal-700">
                    {(prediction.confidenceScore * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Kolom Versi Model */}
                <div className="flex-2 p-3 text-center bg-white rounded-lg shadow-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Model
                  </span>
                  <p className="mt-1 text-base font-mono text-gray-600 sm:text-lg">
                    {prediction.modelVersion}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default TextPredictForm;
