// src/services/api.js (seperti yang sudah kita bahas sebelumnya)
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1"; // Fallback jika .env lupa

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("judiGuardToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const registerUserApi = async (userData) => {
  try {
    // userData dari form sekarang akan memiliki: userName, email, password
    const payload = {
      username: userData.userName, // Map userData.userName ke payload.username
      email: userData.email,
      password: userData.password,
    };
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Registrasi gagal dari API");
  }
};

export const loginUserApi = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    // Backend akan merespons dengan { status, message, data: { token, user } }
    return response.data;
  } catch (error) {
    // Lempar error agar bisa ditangkap di komponen
    throw error.response?.data || new Error("Login gagal dari API");
  }
};

// Placeholder untuk Google Sign-In API call
export const signInWithGoogleApi = async (idToken) => {
  try {
    const response = await apiClient.post("/auth/google/signin", { idToken });
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error("Google Sign-In gagal dari API");
  }
};

// Fungsi untuk mendapatkan data user saat ini (untuk verifikasi token)
export const getCurrentUserApi = async () => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching current user:",
      error.response?.data || error.message
    );
    throw error.response?.data || new Error("Gagal mengambil data pengguna");
  }
};

export const verifyOtpApi = async (email, otpCode) => {
  try {
    const response = await apiClient.post("/auth/verify-otp", {
      email,
      otpCode,
    });
    return response.data; // Berisi { status, message, data: { token, user } }
  } catch (error) {
    throw error.response?.data || new Error("Verifikasi OTP gagal");
  }
};

export const resendOtpApi = async (email) => {
  try {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data; // Berisi { status, message }
  } catch (error) {
    throw error.response?.data || new Error("Gagal mengirim ulang OTP");
  }
};

// Anda bisa menambahkan fungsi API lainnya di sini nanti
// export const connectYoutubeAccountApi = () => { ... };
// export const submitVideoForAnalysisApi = (videoUrl) => { ... };

export default apiClient; // Ekspor instance apiClient jika diperlukan di tempat lain (opsional)
