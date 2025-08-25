// // src/context/AuthContext.jsx

// /* eslint-disable react-refresh/only-export-components */
// import React, {
//   createContext,
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
// } from "react";
// import apiClient, { getCurrentUserApi } from "../services/api"; // API call untuk verifikasi token
// import PropTypes from "prop-types";

// export const AuthContext = createContext(null);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   // authToken mengambil dari localStorage sebagai nilai awal
//   const [authToken, setAuthToken] = useState(
//     localStorage.getItem("judiGuardToken")
//   );
//   // isLoadingAuth untuk menandai proses verifikasi token awal saat aplikasi dimuat
//   const [isLoadingAuth, setIsLoadingAuth] = useState(true);

//   const clearAuthData = useCallback(() => {
//     localStorage.removeItem("judiGuardToken");
//     localStorage.removeItem("judiGuardUser");
//     setAuthToken(null);
//     setCurrentUser(null);
//     // Jika Anda menggunakan interceptor Axios yang diset secara dinamis,
//     // Anda mungkin juga ingin membersihkan header Authorization di sini,
//     // tapi jika interceptor selalu membaca dari localStorage, ini tidak perlu.
//     delete apiClient.defaults.headers.common["Authorization"];
//   }, []);

//   useEffect(() => {
//     const verifyTokenAndFetchUser = async () => {
//       const storedToken = localStorage.getItem("judiGuardToken");

//       if (storedToken) {
//         // Meskipun interceptor mungkin sudah mengatur token dari localStorage,
//         // setAuthToken di sini penting untuk state `isAuthenticated` di context.
//         // Dan jika ada komponen yang langsung bergantung pada `authToken` dari context.
//         setAuthToken(storedToken);
//         // Jika apiClient Anda tidak secara otomatis menambahkan token dari localStorage,
//         // Anda perlu menambahkannya di sini sebelum memanggil getCurrentUserApi
//         apiClient.defaults.headers.common["Authorization"] =
//           `Bearer ${storedToken}`;

//         try {
//           // Panggil backend untuk verifikasi token dan dapatkan data user.
//           // Diasumsikan getCurrentUserApi() menggunakan instance Axios yang sudah ada interceptor
//           // yang mengambil token dari localStorage.
//           const response = await getCurrentUserApi(); // response.data.user harusnya sudah lengkap
//           if (response && response.data && response.data.user) {
//             setCurrentUser(response.data.user); // User dari API adalah source of truth
//           } else {
//             // Respons tidak sesuai harapan, anggap token tidak valid
//             throw new Error("Format data pengguna tidak valid dari API.");
//           }
//         } catch (error) {
//           console.warn(
//             "Token tidak valid atau sesi kedaluwarsa saat verifikasi awal. Menghapus token.",
//             error.response?.data?.message || error.message || error
//           );
//           clearAuthData(); // Gunakan fungsi terpusat untuk membersihkan
//         }
//       }
//       setIsLoadingAuth(false);
//     };

//     verifyTokenAndFetchUser();
//   }, [clearAuthData]); // clearAuthData adalah useCallback, jadi aman di dependensi

//   // Fungsi login, dipanggil setelah registrasi, login standar, atau login via Google berhasil dari backend
//   const login = useCallback((userData, token) => {
//     localStorage.setItem("judiGuardToken", token);
//     localStorage.setItem("judiGuardUser", JSON.stringify(userData));

//     setAuthToken(token);
//     setCurrentUser(userData); // `userData` harusnya objek pengguna yang lengkap dari backend
//     // termasuk `isYoutubeConnected` dan `youtubeChannelName` setelah login Google.

//     // Jika Anda mengatur header Axios secara manual (bukan hanya via interceptor localStorage):
//     // apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//   }, []);

//   const logout = useCallback(() => {
//     clearAuthData();
//     // Tambahkan logika lain jika perlu, misalnya redirect ke halaman login
//     // navigate('/login'); // Jika Anda menggunakan useNavigate di sini
//   }, [clearAuthData]);

// const refreshUser = async () => {
//     try {
//       const response = await getCurrentUserApi();
//       if (response?.data?.user) {
//         const updatedUser = response.data.user;
//         setCurrentUser(updatedUser); // 1. Update state React
//         localStorage.setItem('judiGuardUser', JSON.stringify(updatedUser)); // 2. UPDATE localStorage
//         return updatedUser;
//       }
//     } catch (error) {
//       console.error("Gagal refresh data pengguna:", error);
//       // Mungkin panggil logout jika refresh gagal
//       logout();
//     }
//   };

//   const value = {
//     currentUser,
//     authToken,
//     isAuthenticated: !!authToken, // Benar, ini cara yang baik untuk menentukan status autentikasi
//     isLoadingAuth,
//     login, // Pastikan fungsi ini dipanggil dengan data user yang lengkap dari backend setelah login Google
//     logout,
//     refreshUser
//     // Anda bisa tambahkan fungsi untuk update currentUser jika profil diedit, dll.
//     // updateUser: (updatedUserData) => setCurrentUser(updatedUserData),
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {/* Tampilkan children hanya jika proses loading autentikasi awal sudah selesai */}
//       {
//         !isLoadingAuth
//           ? children
//           : null /* Atau tampilkan spinner/loading global */
//       }
//     </AuthContext.Provider>
//   );
// };

// AuthProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

//==================================================================================
// src/contexts/AuthContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getCurrentUserApi } from "../services/api"; // Pastikan path ini benar

// Membuat Context
export const AuthContext = createContext(null);

// Custom hook untuk mempermudah penggunaan context di komponen lain
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * AuthProvider adalah komponen yang membungkus seluruh aplikasi.
 * Ia bertanggung jawab untuk mengelola state autentikasi (data pengguna, status loading),
 * dan menyediakan fungsi-fungsi seperti login, logout, dan refresh user.
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // State PENTING untuk menandai proses verifikasi sesi awal
  const navigate = useNavigate();

  /**
   * Fungsi terpusat untuk membersihkan semua data sesi dari browser dan state.
   */
  const clearSession = useCallback(() => {
    localStorage.removeItem("judiGuardToken");
    localStorage.removeItem("judiGuardUser");
    setCurrentUser(null);
  }, []);

  /**
   * Fungsi logout.
   */
  const logout = useCallback(() => {
    console.log("[AuthContext] Pengguna melakukan logout.");
    clearSession();
    navigate("/login", { replace: true }); // Arahkan ke halaman login
  }, [clearSession, navigate]);

  /**
   * Fungsi yang dipanggil setelah pengguna berhasil login atau register.
   * @param {object} userData - Objek pengguna lengkap dari respons API backend.
   * @param {string} token - Token JWT dari respons API backend.
   */
  const login = useCallback((userData, token) => {
    localStorage.setItem("judiGuardToken", token);
    localStorage.setItem("judiGuardUser", JSON.stringify(userData));
    setCurrentUser(userData);
    console.log("[AuthContext] Sesi login berhasil disimpan.");
  }, []);

  // Efek ini hanya berjalan SEKALI saat aplikasi pertama kali dimuat.
  // Tujuannya adalah untuk memeriksa apakah ada sesi (token) yang valid di localStorage.
  useEffect(() => {
    const verifyUserSession = async () => {
      const token = localStorage.getItem("judiGuardToken");

      // Jika tidak ada token, langsung selesai loading, tidak ada pengguna.
      if (!token) {
        console.log("[AuthContext] Tidak ada token, sesi dianggap tidak ada.");
        setIsLoadingAuth(false);
        return;
      }

      console.log(
        "[AuthContext] Token ditemukan, mencoba verifikasi ke backend..."
      );
      try {
        const response = await getCurrentUserApi();
        if (response?.status === "success" && response.data?.user) {
          const userFromApi = response.data.user;
          console.log(
            `[AuthContext] Verifikasi berhasil untuk user: ${userFromApi.username}`
          );
          // Set state dan simpan data terbaru ke localStorage
          login(userFromApi, token); // Gunakan fungsi login untuk konsistensi
        } else {
          throw new Error("Format data pengguna tidak valid dari API.");
        }
      } catch (error) {
        // Ini akan menangkap error jika token usang atau pengguna sudah tidak ada lagi.
        console.warn(
          "[AuthContext] Verifikasi token gagal. Membersihkan sesi...",
          error.message
        );
        clearSession(); // Hapus token dan user yang tidak valid
      } finally {
        // Apapun hasilnya (sukses atau gagal), proses verifikasi awal selesai.
        setIsLoadingAuth(false);
      }
    };

    verifyUserSession();
  }, [clearSession, login]); // Bergantung pada fungsi stabil

  /**
   * Fungsi untuk me-refresh data pengguna secara manual jika diperlukan (misal: setelah edit profil).
   * @returns {Promise<object|null>} Objek pengguna yang diperbarui.
   */
  const refreshUser = useCallback(async () => {
    console.log("[AuthContext] Me-refresh data pengguna...");
    try {
      const response = await getCurrentUserApi();
      if (response?.status === "success" && response.data?.user) {
        const updatedUser = response.data.user;
        // Gunakan fungsi login untuk update state dan localStorage secara konsisten
        const currentToken = localStorage.getItem("judiGuardToken");
        login(updatedUser, currentToken);
        return updatedUser;
      }
      throw new Error("Gagal me-refresh data: Format tidak valid.");
    } catch (error) {
      console.error(
        "[AuthContext] Gagal me-refresh pengguna, sesi mungkin tidak valid:",
        error.message
      );
      logout(); // Jika refresh gagal, kemungkinan sesi sudah tidak valid -> logout.
      throw error;
    }
  }, [login, logout]);

  // Nilai yang akan disediakan oleh context ke seluruh aplikasi
  const value = {
    currentUser,
    isAuthenticated: !!currentUser, // Status autentikasi didasarkan pada keberadaan currentUser
    isLoadingAuth, // Status loading sesi awal
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
