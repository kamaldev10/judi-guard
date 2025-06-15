// src/services/api.js (seperti yang sudah kita bahas sebelumnya)
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("judiGuardToken"); // Ambil token dari localStorage
    // console.log(
    //   "[API Interceptor] Attempting to get token from localStorage:",
    //   token
    // ); // DEBUG

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // console.log(
      //   "[API Interceptor] Authorization header set:",
      //   config.headers["Authorization"]
      // ); // DEBUG
    }
    return config;
  },
  (error) => {
    console.error("[API Interceptor] Error in request interceptor:", error); // DEBUG
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // console.error(
    //   "[API Interceptor] Error in response for path:",
    //   error.config?.url,
    //   error.response?.status,
    //   error.response?.data
    // ); // DEBUG
    // Anda bisa menambahkan logika global di sini, misalnya jika error.response.status === 401,
    // panggil fungsi logout dari AuthContext atau redirect.
    // Namun, pastikan tidak tumpang tindih dengan penanganan error di komponen/hook.
    return Promise.reject(error);
  }
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
    throw (
      error.response?.data ||
      new Error(
        "Registrasi gagal. Periksa kembali data Anda atau coba lagi nanti."
      )
    );
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

export const getCurrentUserApi = async () => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data; // Backend Anda mengirim: { status, message, data: { user } }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Gagal mengambil data pengguna. Sesi Anda mungkin telah berakhir, silakan login kembali.";
    throw new Error(message);
  }
};

export const deleteMyAccountApi = async () => {
  try {
    const response = await apiClient.delete("/users/deleteMe");
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Gagal menghapus akun. Silakan coba lagi nanti.";
    throw new Error(message);
  }
};

export const updateMyProfileApi = async (profileData) => {
  try {
    const response = await apiClient.patch("/users/updateMe", profileData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Gagal memperbarui profil. Silakan coba lagi nanti.";
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

export const initiateYoutubeOAuthRedirectApi = async () => {
  // console.log("[API] Memulai permintaan untuk koneksi YouTube..."); // Akan muncul di konsol sebelum RAW RESPONSE
  try {
    const axiosResponse = await apiClient.get("/auth/youtube/connect"); // apiClient adalah instance Axios Anda
    return axiosResponse.data; // Ini akan menjadi objek JSON dari backend
  } catch (error) {
    console.error(
      "[API] Error di initiateYoutubeOAuthRedirectApi:",
      error.response?.data || error.message,
      error
    );
    throw error; // Lempar error agar ditangkap oleh useProfilePresenter
  }
};

export const disconnectYoutubeAccountApi = async () => {
  console.log("[API] Memutus koneksi akun YouTube...");
  try {
    // Gunakan apiClient agar interceptor menambahkan Authorization header
    // Sesuaikan method (POST) dan endpoint dengan yang Anda definisikan di backend
    const response = await apiClient.post("/auth/youtube/disconnect");

    // Backend Anda mengirim: { success: true, message: "...", data: { user: updatedUser } }
    // Jadi, response.data akan menjadi objek tersebut.
    return response.data; // Kembalikan seluruh data dari backend (termasuk success, message, dan user)
  } catch (error) {
    console.error(
      "[API] Error saat disconnectYoutubeAccountApi:",
      error.response?.data || error.message
    );
    const message =
      error.response?.data?.message || // Pesan dari backend
      error.message || // Pesan error umum
      "Gagal memutuskan koneksi akun YouTube. Silakan coba lagi.";
    // Lempar error agar bisa ditangani oleh useProfilePresenter
    // Anda mungkin ingin melempar objek Error dengan pesan yang sudah diformat
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

/**
 * Menganalisis sebuah teks dengan memanggil endpoint backend /text/predict.
 * @param {string} text - Teks yang akan dianalisis.
 * @returns {Promise<object>} Data hasil analisis dari backend.
 */
export const predictTextApi = async (text) => {
  try {
    const response = await apiClient.post("/text/predict", { text });

    return response.data;
  } catch (error) {
    // 5. Tangani error dengan cara yang konsisten dengan fungsi API lainnya.
    const message =
      error.response?.data?.message ||
      "Terjadi kesalahan saat melakukan prediksi teks.";
    throw new Error(message);
  }
};

//submit video analysis
export const submitVideoForAnalysisApi = async (videoUrl) => {
  try {
    const response = await apiClient.post("/analysis/videos", { videoUrl });
    // response.data seharusnya adalah objek VideoAnalysis yang sudah diproses (atau minimal ID dan status awal)
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: videoAnalysisObject }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Mengambil detail dan status dari sebuah VideoAnalysis.
 * Digunakan untuk polling jika analisis di backend bersifat asinkron.
 * Untuk V1 (sinkron), ini mungkin tidak terlalu dipakai untuk polling status analisis,
 * tapi berguna untuk mendapatkan update data VideoAnalysis.
 */
export const getVideoAnalysisApi = async (analysisId) => {
  try {
    const response = await apiClient.get(`/analysis/videos/${analysisId}`);
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: videoAnalysisObject }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Mengambil semua komentar yang telah dianalisis untuk sebuah VideoAnalysis.
 */
export const getAnalyzedCommentsApi = async (analysisId) => {
  try {
    const response = await apiClient.get(
      `/analysis/videos/${analysisId}/comments`
    );
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: [arrayOfComments] }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Meminta penghapusan semua komentar "JUDI" untuk sebuah VideoAnalysis.
 * Untuk V1, kita asumsikan backend memproses ini secara sinkron.
 */
export const batchDeleteJudiCommentsApi = async (analysisId) => {
  try {
    const response = await apiClient.delete(
      `/analysis/videos/${analysisId}/judi-comments`
    );
    return response.data.data; // Asumsi backend mengembalikan { success: true, data: { summary } }
  } catch (error) {
    throw new Error(error);
  }
};

// Meminta penghapusan satu komentar spesifik.
export const deleteSingleCommentApi = async (analyzedCommentId) => {
  try {
    const response = await apiClient.delete(
      `/analysis/comments/${analyzedCommentId}`
    );
    return response.data; // Asumsi backend mengembalikan { success: true, message: "..." }
  } catch (error) {
    throw new Error(error);
  }
};

/**
 * Mengambil link moderasi komentar dari backend.
 * @param {string} analysisId - ID dari analisis yang sedang dilihat.
 * @returns {Promise<string>} URL ke YouTube Studio.
 */
export const getStudioLinkApi = async (analysisId) => {
  try {
    const response = await apiClient.get(`/studio/comments-link/${analysisId}`);
    return response.data.data.url;
  } catch (error) {
    const message =
      error.response?.data?.message || "Gagal mendapatkan link YouTube Studio.";
    throw new Error(message);
  }
};

export default apiClient;
