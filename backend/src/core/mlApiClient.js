/**
 * File ini mengekspor sebuah instance 'axios' yang sudah dikonfigurasi
 * khusus untuk berkomunikasi dengan layanan ML API kita.
 * Mengatur baseURL dan timeout di satu tempat membuat kode lebih bersih dan aman.
 */
const axios = require("axios");
require("dotenv").config(); // Memuat variabel dari file .env

const mlApiClient = axios.create({
  baseURL: process.env.ML_API_URL,
  timeout: 15000, // Batas waktu 15 detik, jika ML API lambat merespons
  headers: {
    "Content-Type": "application/json",
  },
});

module.exports = mlApiClient;
