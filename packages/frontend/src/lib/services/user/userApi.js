import { apiClient } from "../apiClient";

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
