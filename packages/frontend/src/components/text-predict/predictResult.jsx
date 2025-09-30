import React from "react";
import PropTypes from "prop-types";

const classificationColors = {
  JUDI: "bg-red-500 text-slate-200",
  NON_JUDI: "bg-green-500 text-slate-200",
  OTHER: "bg-yellow-400 text-slate-200",
};

const PredictResults = ({ prediction, clear }) => {
  if (!prediction) return null;

  const { classification, confidenceScore, modelVersion } = prediction;
  const classificationColor =
    classificationColors[classification] || classificationColors.OTHER;

  return (
    <div className=" mx-auto mt-6">
      <div className="relative group">
        {/* Background gradient blur */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-slate-400 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500" />

        <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Hasil Prediksi
              </p>
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
                className={`block text-2xl sm:text-3xl font-bold  ${classificationColor}`}
              >
                {classification}
              </span>
              <span className="text-sm text-slate-200 dark:text-gray-400 mt-1">
                Classification
              </span>
            </div>

            {/* Confidence Score */}
            <div className="relative overflow-hidden sm:col-span-2 rounded-lg p-4 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
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
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full font-semibold hover:scale-105 transform transition-transform duration-300"
            >
              Reset Hasil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PredictResults.propTypes = {
  prediction: PropTypes.shape({
    classification: PropTypes.string.isRequired,
    confidenceScore: PropTypes.number.isRequired,
    modelVersion: PropTypes.string.isRequired,
  }).isRequired,
  clear: PropTypes.string.isRequired,
};

export default PredictResults;
