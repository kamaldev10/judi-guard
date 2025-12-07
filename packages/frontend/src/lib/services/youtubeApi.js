import { apiClient } from "./apiClient";

// Helper untuk error handling konsisten
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message || defaultMessage || "Terjadi kesalahan.";
  throw new Error(message);
};

// 🔹 REDIRECT YT
export const initiateYoutubeOAuthRedirectApi = async () => {
  // console.log("[API] Memulai permintaan untuk koneksi YouTube..."); // Akan muncul di konsol sebelum RAW res
  try {
    const response = await apiClient.get("/auth/youtube/connect");
    return response.data;
  } catch (error) {
    // console.error(
    //   "[API] Error di initiateYoutubeOAuthRedirectApi:",
    //   error.response?.data || error.message,
    //   error
    // );
    handleApiError(
      error,
      "Terjadi kesalahan saat meminta untuk koneksi Youtube."
    );
  }
};

// 🔹 DISCONNECT YT ACC
export const disconnectYoutubeAccountApi = async () => {
  // console.log("[API] Memutus koneksi akun YouTube...");
  try {
    const response = await apiClient.post("/auth/youtube/disconnect");

    return response.data;
  } catch (error) {
    // console.error(
    //   "[API] Error saat disconnectYoutubeAccountApi:",
    //   error.response?.data || error.message
    // );
    handleApiError(
      error,
      "Gagal memutuskan koneksi akun YouTube. Silakan coba lagi."
    );
  }
};
