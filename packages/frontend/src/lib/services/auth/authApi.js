import { apiClient } from "../apiClient";

export const registerUserApi = async (userData) => {
  try {
    // Map form data to API payload
    const payload = {
      username: userData.userName, // Map userName to username
      email: userData.email,
      password: userData.password,
    };

    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Registrasi gagal. Periksa kembali data Anda atau coba lagi nanti.";

    throw new Error(errorMessage);
  }
};

export const loginUserApi = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Login gagal. Periksa email dan password Anda atau coba lagi nanti.";
    throw new Error(message);
  }
};

export const signInWithGoogleApi = async (idToken) => {
  try {
    const response = await apiClient.post("/auth/google/signin", { idToken });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Google Sign-In gagal. Silakan coba lagi atau gunakan metode login biasa.";
    throw new Error(message);
  }
};

export const verifyOtpApi = async (email, otpCode) => {
  try {
    const response = await apiClient.post("/auth/verify-otp", {
      email,
      otpCode,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Verifikasi OTP gagal. Kode OTP salah atau telah kedaluwarsa.";
    throw new Error(message);
  }
};

export const resendOtpApi = async (email) => {
  try {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Gagal mengirim ulang OTP. Silakan coba lagi setelah beberapa saat.";
    throw new Error(message);
  }
};

export const forgotPasswordApi = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Terjadi kesalahan saat meminta reset kata sandi.";
    throw new Error(message);
  }
};

export const resetPasswordApi = async (token, newPassword) => {
  try {
    const response = await apiClient.post(`/auth/reset-password/${token}`, {
      password: newPassword,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Terjadi kesalahan saat mereset kata sandi Anda.";
    throw new Error(message);
  }
};

export const changePasswordApi = async (currentPassword, newPassword) => {
  try {
    const response = await apiClient.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Terjadi kesalahan saat mengubah kata sandi.";
    throw new Error(message);
  }
};
