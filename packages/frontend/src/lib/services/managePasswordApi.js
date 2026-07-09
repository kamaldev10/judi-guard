import { apiClient } from './apiClient';

// Helper untuk error handling konsisten
const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

// 🔹 FORGOT PASSWORD
export const forgotPasswordApi = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Terjadi kesalahan saat meminta reset kata sandi.');
  }
};

// 🔹 RESET PASSWORD
export const resetPasswordApi = async (token, newPassword, confirmNewPassword) => {
  try {
    const response = await apiClient.put(`/auth/reset-password/${token}`, {
      password: newPassword,
      confirmPassword: confirmNewPassword,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Terjadi kesalahan saat mereset kata sandi Anda.');
  }
};

// 🔹 CHANGE PASSWORD
export const changePasswordApi = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await apiClient.patch('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengubah kata sandi.');
  }
};
