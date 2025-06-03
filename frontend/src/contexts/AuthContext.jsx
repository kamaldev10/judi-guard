// src/context/AuthContext.jsx

/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import apiClient, { getCurrentUserApi } from "../services/api"; // API call untuk verifikasi token
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // authToken mengambil dari localStorage sebagai nilai awal
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("judiGuardToken")
  );
  // isLoadingAuth untuk menandai proses verifikasi token awal saat aplikasi dimuat
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem("judiGuardToken");
    // Tidak perlu lagi localStorage.removeItem("judiGuardUser");
    setAuthToken(null);
    setCurrentUser(null);
    // Jika Anda menggunakan interceptor Axios yang diset secara dinamis,
    // Anda mungkin juga ingin membersihkan header Authorization di sini,
    // tapi jika interceptor selalu membaca dari localStorage, ini tidak perlu.
    delete apiClient.defaults.headers.common["Authorization"];
  }, []);

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      const storedToken = localStorage.getItem("judiGuardToken");

      if (storedToken) {
        // Meskipun interceptor mungkin sudah mengatur token dari localStorage,
        // setAuthToken di sini penting untuk state `isAuthenticated` di context.
        // Dan jika ada komponen yang langsung bergantung pada `authToken` dari context.
        setAuthToken(storedToken);
        // Jika apiClient Anda tidak secara otomatis menambahkan token dari localStorage,
        // Anda perlu menambahkannya di sini sebelum memanggil getCurrentUserApi
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${storedToken}`;

        try {
          // Panggil backend untuk verifikasi token dan dapatkan data user.
          // Diasumsikan getCurrentUserApi() menggunakan instance Axios yang sudah ada interceptor
          // yang mengambil token dari localStorage.
          const response = await getCurrentUserApi(); // response.data.user harusnya sudah lengkap
          if (response && response.data && response.data.user) {
            setCurrentUser(response.data.user); // User dari API adalah source of truth
          } else {
            // Respons tidak sesuai harapan, anggap token tidak valid
            throw new Error("Format data pengguna tidak valid dari API.");
          }
        } catch (error) {
          console.warn(
            "Token tidak valid atau sesi kedaluwarsa saat verifikasi awal. Menghapus token.",
            error.response?.data?.message || error.message || error
          );
          clearAuthData(); // Gunakan fungsi terpusat untuk membersihkan
        }
      }
      setIsLoadingAuth(false);
    };

    verifyTokenAndFetchUser();
  }, [clearAuthData]); // clearAuthData adalah useCallback, jadi aman di dependensi

  // Fungsi login, dipanggil setelah registrasi, login standar, atau login via Google berhasil dari backend
  const login = useCallback((userData, token) => {
    localStorage.setItem("judiGuardToken", token);
    // Tidak perlu lagi localStorage.setItem("judiGuardUser", JSON.stringify(userData));

    setAuthToken(token);
    setCurrentUser(userData); // `userData` harusnya objek pengguna yang lengkap dari backend
    // termasuk `isYoutubeConnected` dan `youtubeChannelName` setelah login Google.

    // Jika Anda mengatur header Axios secara manual (bukan hanya via interceptor localStorage):
    // apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    // Tambahkan logika lain jika perlu, misalnya redirect ke halaman login
    // navigate('/login'); // Jika Anda menggunakan useNavigate di sini
  }, [clearAuthData]);

  const value = {
    currentUser,
    authToken,
    isAuthenticated: !!authToken, // Benar, ini cara yang baik untuk menentukan status autentikasi
    isLoadingAuth,
    login, // Pastikan fungsi ini dipanggil dengan data user yang lengkap dari backend setelah login Google
    logout,
    // Anda bisa tambahkan fungsi untuk update currentUser jika profil diedit, dll.
    // updateUser: (updatedUserData) => setCurrentUser(updatedUserData),
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Tampilkan children hanya jika proses loading autentikasi awal sudah selesai */}
      {
        !isLoadingAuth
          ? children
          : null /* Atau tampilkan spinner/loading global */
      }
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
