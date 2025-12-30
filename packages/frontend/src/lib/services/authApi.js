// lib/services/authApi.js
import { apiClient } from "./apiClient";

// Helper untuk error handling konsisten
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message || defaultMessage || "Terjadi kesalahan.";
  throw new Error(message);
};

// 🔹 REGISTER
export const registerUserApi = async (userData) => {
  try {
    const payload = {
      username: userData.userName,
      email: userData.email,
      password: userData.password,
    };
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    handleApiError(error, "Gagal melakukan pendaftaran.");
  }
};

// 🔹 LOGIN
export const loginUserApi = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    handleApiError(error, "Gagal login. Periksa kembali kredensial Anda.");
  }
};

// 🔹 SIGN IN GOOGLE
export const signInWithGoogleApi = async (idToken) => {
  try {
    const response = await apiClient.post("/auth/google/signin", { idToken });
    return response?.data?.data;
  } catch (error) {
    handleApiError(error, "Login Google gagal.");
  }
};

// 🔹 VERIFY OTP
export const verifyOtpApi = async (email, otpCode) => {
  try {
    const response = await apiClient.post("/auth/verify-otp", {
      email,
      otpCode,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, "Verifikasi OTP gagal.");
  }
};

// 🔹 RESEND OTP
export const resendOtpApi = async (email) => {
  try {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  } catch (error) {
    handleApiError(error, "Gagal mengirim ulang OTP.");
  }
};
