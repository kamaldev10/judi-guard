import { apiClient } from "./apiClient";

// Helper untuk error handling konsisten
const handleApiError = (error, defaultMessage) => {
  const message =
    error.response?.data?.message || defaultMessage || "Terjadi kesalahan.";
  throw new Error(message);
};

// ---------------------- NEW LOGIC ------------------------

/**
 * 1. Mendapatkan URL Auth Google (Langkah 1 Connect)
 * Backend akan mengembalikan URL, Frontend me-redirect user ke sana.
 */
export const getGoogleAuthUrlApi = async () => {
  try {
    const response = await apiClient.get("/auth/guest/connect");
    // Asumsi response: { status: "success", data: { url: "https://accounts.google..." } }
    return response.data.data.url;
  } catch (error) {
    handleApiError(error, "Gagal mendapatkan URL Login.");
  }
};

/**
 * 2. Mengirim Auth Code ke Backend (Langkah 2 Callback)
 * Dipanggil saat Google me-redirect balik ke halaman /auth/callback?code=...
 */
export const handleGoogleCallbackApi = async (code) => {
  try {
    const response = await apiClient.get(`/auth/guest/callback?code=${code}`);
    // Backend akan set cookie/token di sini.
    // Return data user/channel info
    return response.data.data;
  } catch (error) {
    handleApiError(error, " Gagal verifikasi akun Google.");
  }
};

/**
 * 3. Mendapatkan Profil Channel yang Sedang Terhubung
 * Berguna untuk menampilkan "Connected as: GadgetIn" di Dashboard
 */
export const getConnectedChannelProfileApi = async () => {
  try {
    const response = await apiClient.get("/auth/youtube/profile");
    return response.data.data;
  } catch (error) {
    // Silent error (mungkin belum connect), return null
    return null;
  }
};

/**
 * 4. Logout / Disconnect YouTube (Khusus Guest)
 * Membersihkan sesi YouTube tanpa menghapus akun aplikasi utama (jika ada)
 */
export const disconnectYoutubeApi = async () => {
  try {
    await apiClient.post("/auth/guest/disconnect");
    return true;
  } catch (error) {
    handleApiError(error, "Gagal memutuskan koneksi YouTube.");
  }
};

// ----------------------------------------------------------

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
      "Terjadi kesalahan saat meminta untuk koneksi Youtube.",
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
      "Gagal memutuskan koneksi akun YouTube. Silakan coba lagi.",
    );
  }
};
