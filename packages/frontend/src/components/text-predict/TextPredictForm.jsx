import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTextPredict } from "@/hooks/text-predict/useTextPredict";
import { SearchIcon } from "@/assets/icons/SearchIcon";
import { LoadingSpinner } from "@/assets/icons/LoadingSpinner";
import PredictResults from "./predictResult";

const TextPredictForm = () => {
  const [inputText, setInputText] = useState("");

  const { prediction, isLoading, error, analyze, clear } = useTextPredict();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputText.trim()) return;
    analyze(inputText);
  };

  return (
    <motion.section
      className="min-h-[50vh] w-full px-6 py-4 sm:px-8 sm:py-6 bg-teal-50 rounded-2xl shadow-md"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      {/* Form Input */}
      <motion.form onSubmit={handleSubmit} className="relative mt-4 sm:mt-6">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full px-5 py-3 pr-32 text-sm sm:text-base text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-100 transition"
          placeholder="Contoh: Menang judi bola sampai WD 100Jt"
          disabled={isLoading}
          required
        />

        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center h-full px-4 sm:px-6 py-2 text-sm font-semibold text-white bg-teal-700 rounded-full shadow-sm hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:bg-teal-500 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <SearchIcon />
                <span className="hidden sm:inline sm:ml-2">Analisis</span>
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Area Hasil */}
      <div className="mt-6">
        <AnimatePresence>
          {!prediction && !isLoading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-gray-700"
            >
              ⚠️ Tidak ada teks yang diprediksi. Silahkan masukkan teks Anda.
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center items-center py-24"
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

          {prediction && (
            <PredictResults prediction={prediction} clear={clear} />
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default TextPredictForm;
