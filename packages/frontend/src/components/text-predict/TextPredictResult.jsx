import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

const classificationColors = {
  JUDI: "bg-red-500 text-slate-200",
  NON_JUDI: "bg-green-500 text-slate-200",
  OTHER: "bg-yellow-400 text-slate-200",
};

const TextPredictResult = ({ prediction, isLoading, error, clear }) => {
  return (
    <div className="mt-6">
      <AnimatePresence mode="wait">
        {/* === 1. Loading State === */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center items-center py-24"
          >
            <p className="text-teal-600">Menganalisis dengan model AI...</p>
          </motion.div>
        )}

        {/* === 2. Error State === */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 font-semibold text-center text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            Error: {error}
          </motion.div>
        )}

        {/* === 3. Prediction (Success) State === */}
        {prediction && (
          <motion.div
            data-cy="prediction-result-container"
            key="prediction"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ResultCard prediction={prediction} clear={clear} />
          </motion.div>
        )}

        {/* === 4. Initial State === */}
        {!prediction && !isLoading && !error && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-10 text-gray-700"
          >
            ⚠️ Tidak ada teks yang diprediksi. Silahkan masukkan teks Anda.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

TextPredictResult.propTypes = {
  prediction: PropTypes.object,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  clear: PropTypes.func.isRequired,
};

const ResultCard = ({ prediction, clear }) => {
  const { classification, confidenceScore, modelVersion } = prediction;
  const classificationColor =
    classificationColors[classification] || classificationColors.OTHER;

  return (
    <div className="mx-auto">
      <div className="relative group">
        {/* Background gradient blur */}
        <div className="absolute -inset-1 bg-linear-to-r from-gray-400 to-slate-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />

        <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Hasil Prediksi
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Model: {modelVersion}
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-teal-50 dark:bg-teal-900/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
              <span className="text-sm text-teal-700 dark:text-teal-400 font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Result Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            {/* Classification */}
            <div
              className={`relative overflow-hidden rounded-lg p-4 shadow-sm flex flex-col justify-center items-center ${classificationColor} bg-opacity-10`}
            >
              <span
                className={`block text-2xl sm:text-3xl font-bold ${classificationColor}`}
              >
                {classification}
              </span>
              <span className="text-sm text-slate-200 dark:text-gray-400 mt-1">
                Classification
              </span>
            </div>

            {/* Confidence Score */}
            <div className="relative overflow-hidden sm:col-span-2 rounded-lg p-4 shadow-sm bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                  Confidence Score
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-200">
                  {(confidenceScore * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(confidenceScore * 100).toFixed(1)}%`,
                    background:
                      classification === "JUDI"
                        ? "linear-gradient(to right, #f87171, #ef4444)"
                        : classification === "NON_JUDI"
                          ? "linear-gradient(to right, #34d399, #10b981)"
                          : "linear-gradient(to right, #facc15, #f59e0b)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center sm:justify-start">
            <button
              onClick={clear}
              className="px-6 py-2 bg-linear-to-r from-teal-500 to-cyan-500 text-white rounded-full font-semibold hover:scale-105 transform transition-transform duration-300"
            >
              Reset Hasil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ResultCard.propTypes = {
  prediction: PropTypes.shape({
    classification: PropTypes.string.isRequired,
    confidenceScore: PropTypes.number.isRequired,
    modelVersion: PropTypes.string.isRequired,
  }).isRequired,
  clear: PropTypes.func.isRequired,
};

export default TextPredictResult;
