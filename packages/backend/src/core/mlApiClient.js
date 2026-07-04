//src/core/mlApiClient

/**
 * File ini mengekspor sebuah instance 'axios' yang sudah dikonfigurasi
 * khusus untuk berkomunikasi dengan layanan ML API.
 * Mengatur baseURL dan timeout di satu tempat membuat kode lebih bersih dan aman.
 */
const axios = require('axios');
require('dotenv').config();

const mlApiClient = axios.create({
  baseURL: process.env.ML_API_URL || 'http://127.0.0.1:5000',
  timeout: 60000, // Batas waktu 60 detik, jika ML API lambat merespons
  headers: {
    'Content-Type': 'application/json',
  },
});

module.exports = mlApiClient;
