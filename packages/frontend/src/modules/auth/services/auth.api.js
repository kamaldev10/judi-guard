import apiClient from '@/shared/api-client/index.js';

const handleApiError = (error, defaultMessage) => {
  const message = error.response?.data?.message || defaultMessage || 'Terjadi kesalahan.';
  throw new Error(message);
};

export const registerUser = async (userData) => {
  try {
    const payload = {
      username: userData.userName || userData.username,
      email: userData.email,
      password: userData.password,
    };
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal melakukan pendaftaran.');
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal login. Periksa kembali kredensial Anda.');
  }
};

export const signInWithGoogle = async (idToken) => {
  try {
    const response = await apiClient.post('/auth/google/signin', { idToken });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Login Google gagal.');
  }
};

export const verifyOtp = async (email, otpCode) => {
  try {
    const response = await apiClient.post('/auth/verify-otp', { email, otpCode });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Verifikasi OTP gagal.');
  }
};

export const resendOtp = async (email) => {
  try {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal mengirim ulang OTP.');
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Terjadi kesalahan saat meminta reset kata sandi.');
  }
};

export const resetPassword = async (token, newPassword, confirmNewPassword) => {
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

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
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

// --- Endpoint baru v2 ---

export const setPasswordAfterOtp = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/set-password', { email, password });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal membuat password.');
  }
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal memperbarui token.');
  }
};

export const logoutFromServer = async (refreshToken) => {
  try {
    const response = await apiClient.post('/auth/logout', { refreshToken });
    return response.data;
  } catch (error) {
    handleApiError(error, 'Gagal logout.');
  }
};
