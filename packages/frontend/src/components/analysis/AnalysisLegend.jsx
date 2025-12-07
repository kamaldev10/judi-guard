// src/components/AnalysisLegend.jsx (atau path yang Anda gunakan)
import React from "react";
import PropTypes from "prop-types";

const AnalysisLegend = (props) => {
  const { payload } = props; // 'payload' disediakan oleh Recharts <Legend content={...} />

  if (!payload || payload.length === 0) {
    return null;
  }

  return (
    // Styling untuk legenda agar lebih sesuai dengan gambar:
    // Atur posisi dan tampilan agar mirip dengan sisi kanan chart di gambar.
    // ml-4 md:ml-0 mungkin perlu disesuaikan atau dihapus jika layout diatur oleh wrapperStyle Legend.
    <ul className="flex flex-col items-start space-y-2 text-xs sm:text-sm">
      {" "}
      {/* Penyesuaian space dan ukuran font */}
      {payload.map((entry, index) => (
        <li key={`item-${index}`} className="flex items-center text-slate-700">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2.5" // Sedikit lebih besar dan margin
            style={{ backgroundColor: entry.color }} // entry.color disediakan Recharts
          />
          {entry.value}
          <span className="text-slate-500 ml-4">
            {(entry.payload?.percent * 100 || 0).toFixed(0)}%
          </span>
        </li>
      ))}
    </ul>
  );
};

AnalysisLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string, // Nama kategori (misalnya, "Clean", "Spam")
      color: PropTypes.string, // Warna dari Recharts
      payload: PropTypes.shape({
        // Data asli untuk slice ini
        name: PropTypes.string,
        value: PropTypes.number, // Jumlah komentar
        percent: PropTypes.number, // Persentase (disediakan oleh Recharts)
      }),
    })
  ),
};

export default AnalysisLegend;
