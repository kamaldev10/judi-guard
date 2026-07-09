import axios from 'axios';
import 'dotenv/config';

export const mlApiClient = axios.create({
  baseURL: process.env.ML_API_URL || 'http://127.0.0.1:5000',
  timeout: 60000, // Batas waktu 60 detik, jika ML API lambat merespons
  headers: {
    'Content-Type': 'application/json',
  },
});
