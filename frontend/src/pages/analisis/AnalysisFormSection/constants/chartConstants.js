// src/features/video-analysis/constants/chartConstants.js

/**
 * Mendefinisikan pemetaan warna untuk setiap kategori klasifikasi.
 * KEY harus konsisten dengan nilai enum `classification` dari backend.
 */
export const PIE_CHART_COLORS = {
  NON_JUDI: "#585add", // Biru untuk bersih/non-judi
  JUDI: "#dd55ba", // Merah muda untuk judi
  PENDING_ANALYSIS: "#facc15", // Kuning untuk pending
  ERROR_ANALYSIS: "#737373", // Abu-abu untuk error
  UNKNOWN: "#a1a1aa", // Abu-abu muda untuk unknown
};

/**
 * Mendefinisikan nama tampilan (label) untuk setiap kategori.
 * Ini digunakan untuk menampilkan di UI seperti legenda dan chart.
 * KEY harus sama persis dengan key di PIE_CHART_COLORS.
 */
export const CATEGORY_DISPLAY_NAMES = {
  NON_JUDI: "Clean", // Diubah menjadi "Clean" agar sesuai gambar
  JUDI: "Spam", // Diubah menjadi "Spam" agar sesuai gambar
  PENDING_ANALYSIS: "Menunggu Analisis",
  ERROR_ANALYSIS: "Error Analisis",
  UNKNOWN: "Tidak Diketahui",
};
