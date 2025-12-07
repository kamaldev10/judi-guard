import { apiClient } from "./apiClient";

export const getCurrentUserApi = async () => {
  try {
    const res = await apiClient.get("/users/me");
    return res.data; // Backend Anda mengirim: { status, message, data: { user } }
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
