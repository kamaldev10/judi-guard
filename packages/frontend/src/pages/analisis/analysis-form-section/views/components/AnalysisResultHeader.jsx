// src/features/video-analysis/views/components/AnalysisResultHeader.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Menampilkan header untuk hasil analisis.
 * @param {object} props
 * @param {string} props.analysisId - ID unik dari analisis.
 * @param {object} props.videoData - Objek yang berisi detail video seperti judul, ID YouTube, dan status analisis.
 * @param {string} props.pollingMessage - Pesan status selama polling.
 */
const AnalysisResultHeader = ({ analysisId, videoData, pollingMessage }) => {
  return (
    <>
      <h2 className="text-center text-lg md:text-xl font-semibold text-teal-800 mb-2">
        Hasil Analisis untuk:
        <em className="text-base sm:text-lg font-normal block md:inline mt-1 md:mt-0 break-all sm:ms-2">
          {videoData.videoTitle || videoData.youtubeVideoId}
        </em>
      </h2>
      <p className="text-center text-xs text-gray-500 mb-6">
        ID Analisis: {analysisId} | Status:{" "}
        <span
          className={`font-medium px-2 py-0.5 rounded-full text-xs ${
            videoData.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : videoData.status === "FAILED" ||
                  videoData.status?.includes("ERROR")
                ? "bg-red-100 text-red-700"
                : "bg-orange-100 text-orange-700 animate-pulse"
          }`}
        >
          {videoData.status}
        </span>
      </p>
      {/* Pesan jika analisis belum selesai atau gagal */}
      {videoData.status !== "COMPLETED" && (
        <p className="text-gray-600 text-center py-4">
          {videoData.errorMessage ? (
            <>
              <strong>Analisis Gagal:</strong> {videoData.errorMessage}
            </>
          ) : (
            <>
              <strong>Status Analisis Saat Ini:</strong> {videoData.status}.{" "}
              {pollingMessage || "Sedang diproses..."}
            </>
          )}
        </p>
      )}
    </>
  );
};

AnalysisResultHeader.propTypes = {
  analysisId: PropTypes.string.isRequired,
  videoData: PropTypes.shape({
    videoTitle: PropTypes.string,
    youtubeVideoId: PropTypes.string,
    status: PropTypes.string,
    errorMessage: PropTypes.string,
  }).isRequired,
  pollingMessage: PropTypes.string,
};

export default AnalysisResultHeader;
