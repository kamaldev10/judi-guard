// src/features/video-analysis/views/components/AnalysisTooltip.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Komponen kustom untuk menampilkan tooltip pada PieChart Recharts.
 * @param {object} props - Disediakan secara otomatis oleh Recharts.
 * @param {boolean} props.active - Apakah tooltip sedang aktif (di-hover).
 * @param {Array} props.payload - Array berisi data dari slice chart yang di-hover.
 */
const AnalysisTooltip = ({ active, payload }) => {
  // Tampilkan tooltip hanya jika aktif dan ada data
  if (active && payload && payload.length) {
    const data = payload[0]; // Data untuk slice yang di-hover

    return (
      <div className="bg-white/90 backdrop-blur-sm p-3 shadow-lg rounded-lg border border-slate-200 text-sm">
        <p className="font-bold mb-1" style={{ color: data.color }}>
          {data.name} {/* Nama kategori, misal "Clean" atau "Spam" */}
        </p>
        <p className="text-slate-700">
          {/* Nilai numerik (jumlah komentar) */}
          <span className="font-medium">Jumlah:</span>{" "}
          {data.value.toLocaleString()}
        </p>
        <p className="text-slate-500">
          {/* Persentase */}
          <span className="font-medium">Persentase:</span>{" "}
          {(data.payload.percent * 100).toFixed(1)}%
        </p>
      </div>
    );
  }

  return null;
};

// Validasi props untuk memastikan data yang diterima benar
AnalysisTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string, // Nama kategori
      value: PropTypes.number, // Nilai numerik
      color: PropTypes.string, // Warna slice
      payload: PropTypes.shape({
        // Data objek asli
        percent: PropTypes.number, // Persentase (0-1)
      }),
    })
  ),
};

export default AnalysisTooltip;
