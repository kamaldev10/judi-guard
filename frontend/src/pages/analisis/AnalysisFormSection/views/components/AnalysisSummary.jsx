// src/features/video-analysis/views/components/AnalysisSummary.jsx
import React from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import StatBox from "./StatBox";
import AnalysisLegend from "./AnalysisLegend";
import AnalysisTooltip from "./AnalysisTooltip"; // <-- Impor komponen tooltip baru
import {
  CATEGORY_DISPLAY_NAMES,
  PIE_CHART_COLORS,
} from "../../constants/chartConstants"; // <-- Pastikan path ini benar
import { Bolt } from "lucide-react";
/**
 * Komponen utama yang menampilkan ringkasan analisis visual.
 */
const AnalysisSummary = ({
  pieChartData,
  stats,
  onManageComments,
  isActionInProgress,
}) => {
  /**
   * Mendapatkan warna slice berdasarkan nama kategori.
   * Fungsi ini memetakan nama tampilan (misal, "Clean") ke kunci di konstanta warna (misal, "CLEAN").
   * @param {string} displayName - Nama kategori yang ditampilkan (misal, "Clean", "Spam").
   * @returns {string} Kode warna heksadesimal.
   */
  const getPieSliceColor = (displayName) => {
    const keyMap = {
      CLEAN: "NON_JUDI", // Jika data Anda menggunakan 'Clean' tapi konstanta 'NON_JUDI'
      SPAM: "JUDI",
    };
    const normalizedKey = displayName?.toUpperCase();
    const finalKey = keyMap[normalizedKey] || normalizedKey;
    return PIE_CHART_COLORS[finalKey] || "#BBBBBB"; // Warna fallback
  };

  // Data placeholder jika pieChartData kosong atau semua value 0
  const chartData =
    pieChartData && pieChartData.some((d) => d.value > 0)
      ? pieChartData
      : [{ name: "Tidak ada data", value: 1, isEmpty: true }];

  // Fungsi kustom untuk merender label persentase di dalam slice PieChart
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    // Jangan render label untuk data placeholder atau jika persennya 0
    if (chartData[index]?.isEmpty || percent === 0) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-bold text-lg pointer-events-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="relative bg-sky-100 rounded-xl p-6 md:p-8 shadow-lg border border-sky-200">
      {/* Bagian Chart dan Legenda */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
        <div className="w-full md:w-1/2 max-w-[300px]">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                innerRadius={60}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isEmpty ? "#d1d5db" : getPieSliceColor(entry.name)
                    }
                  />
                ))}
              </Pie>
              {/* Gunakan komponen tooltip kustom */}
              <Tooltip
                content={<AnalysisTooltip />}
                cursor={{ fill: "rgba(255, 255, 255, 0.2)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
          {/* Membuat payload untuk legenda secara manual agar lebih terkontrol */}
          <AnalysisLegend
            payload={chartData
              .filter((d) => !d.isEmpty)
              .map((d) => ({
                value: d.name, // Nama tampilan, misal "Clean"
                color: getPieSliceColor(d.name),
                payload: {
                  // Data tambahan yang bisa diakses di dalam AnalysisLegend
                  value: d.value,
                  percent: stats.total > 0 ? d.value / stats.total : 0,
                },
              }))}
          />
        </div>
      </div>

      {/* Garis Pemisah */}
      <hr className="border-t border-sky-200 my-6 md:my-8" />

      {/* Bagian Statistik */}
      <div className="flex flex-col sm:flex-row justify-center flex-wrap gap-4 md:gap-6">
        <StatBox label="Total Komentar" value={stats.total.toLocaleString()} />
        <StatBox
          label="Komentar Judi"
          value={(stats.JUDI || 0).toLocaleString()}
          color="text-pink-600"
        />
        <StatBox
          label="Komentar Bersih"
          value={(stats.NON_JUDI || 0).toLocaleString()}
          color="text-blue-600"
        />
      </div>

      {/* Tombol Hapus Semua (jika ada komentar judi) */}
      {(stats.JUDI || 0) > 0 && (
        <div className="mt-5 justify-end flex">
          <button
            type="button"
            onClick={onManageComments}
            disabled={isActionInProgress}
            className="flex bg-teal-700 text-white px-5 py-2.5 rounded-lg hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-sky-100 transition-all duration-300 font-semibold shadow-md text-sm disabled:opacity-60"
          >
            <Bolt className="w-5 h-5 mr-1 sm:mr-2 text-white cursor-pointer" />
            <span>Kelola Komentar</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ... (PropTypes untuk AnalysisSummary tetap sama) ...
AnalysisSummary.propTypes = {
  pieChartData: PropTypes.array.isRequired,
  stats: PropTypes.object.isRequired,
  onManageComments: PropTypes.func.isRequired,
  isActionInProgress: PropTypes.bool.isRequired,
};

export default AnalysisSummary;
