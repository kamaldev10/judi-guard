// // src/hooks/profile/useProfilePresenter.js

// import { useState, useEffect, useCallback, useContext } from "react"; // Tambahkan useContext
// import { useLocation, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import { toast } from "react-toastify";

// import {
//   getCurrentUserApi,
//   deleteMyAccountApi,
//   initiateYoutubeOAuthRedirectApi,
//   disconnectYoutubeAccountApi,
// } from "../../services/api"; // Sesuaikan path jika perlu
// import { AuthContext } from "../../contexts/AuthContext"; // Impor AuthContext Anda

// /**
//  * Presenter (sebagai custom hook) untuk mengelola semua logika dan state
//  * yang terkait dengan halaman profil pengguna.
//  */
// export const useProfilePresenter = () => {
//   // State lokal untuk data profil
//   const [user, setUser] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fetchError, setFetchError] = useState(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   // State spesifik untuk operasi YouTube
//   const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
//   const [isDisconnectingYouTube, setIsDisconnectingYouTube] = useState(false);
//   const [youtubeStatusMessage, setYoutubeStatusMessage] = useState("");

//   // Menggunakan hooks dari React Router
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Menggunakan AuthContext untuk logout
//   const authContext = useContext(AuthContext);
//   const { logout } = useContext(AuthContext);
//   const { refreshUser } = useContext(AuthContext); // Ambil fungsi dari context

//   /**
//    * Mengambil data profil pengguna terbaru dari server untuk memastikan data sinkron.
//    * Fungsi ini dibungkus dengan useCallback untuk stabilitas referensi.
//    * @param {boolean} [showLoadingIndicator=true] - Apakah akan menampilkan state loading utama.
//    */
//   const fetchProfileData = useCallback(
//     async (showLoadingIndicator = true) => {
//       if (showLoadingIndicator) setIsLoading(true);
//       setFetchError(null); // Selalu reset error di awal fetch

//       try {
//         const responseData = await getCurrentUserApi();
//         // Asumsi API mengembalikan { status: "success", data: { user } }
//         if (
//           responseData &&
//           responseData.status === "success" &&
//           responseData.data?.user
//         ) {
//           setUser(responseData.data.user);
//           // Jika Anda juga menyimpan user di localStorage, update di sini juga
//           // localStorage.setItem('judiGuardUser', JSON.stringify(responseData.data.user));
//         } else {
//           // Jika respons sukses tapi format data salah
//           throw new Error(
//             responseData?.message ||
//               "Gagal memuat data pengguna: Format respons tidak valid."
//           );
//         }
//       } catch (err) {
//         console.error("[useProfilePresenter] Fetch Profile Error:", err);
//         // Simpan objek error asli ke state, ini lebih informatif daripada hanya pesannya
//         setFetchError(err);

//         // --- PERBAIKAN UTAMA: Penanganan Error Berbasis Status Kode ---
//         // Cek apakah error berasal dari respons API dan memiliki status 401 atau 403.
//         // Ini cara yang lebih andal untuk mendeteksi error otorisasi/autentikasi.
//         if (
//           err.response &&
//           (err.response.status === 401 || err.response.status === 403)
//         ) {
//           // Pesan error dari backend (seperti "Pengguna ... tidak ada lagi") sudah ada di err.message
//           toast.error(err.message);

//           // Panggil fungsi logout dari context untuk membersihkan token dan state global secara terpusat
//           logout();

//           // Arahkan ke halaman utama/login
//           // `logout()` mungkin sudah melakukan ini, tapi menambahkannya di sini memberikan jaminan.
//           navigate("/", { replace: true });
//         }
//         // Error lain (misal 500 atau masalah jaringan) akan disimpan di state `fetchError`
//         // dan bisa ditampilkan di UI jika diperlukan.
//       } finally {
//         if (showLoadingIndicator) setIsLoading(false);
//       }
//     },
//     [navigate, logout] // 4. Dependensi useCallback yang benar
//   );

//   // Efek untuk mengambil data profil saat komponen pertama kali dimuat
//   useEffect(() => {
//     fetchProfileData();
//   }, [fetchProfileData]);

//   // Efek untuk menangani pesan status sementara dari operasi YouTube (callback atau aksi)
//   useEffect(() => {
//     const transientKeywords = [
//       "berhasil",
//       "gagal",
//       "diputuskan",
//       "mengarahkan",
//     ];
//     const currentMessage = youtubeStatusMessage || "";

//     const isTransient = transientKeywords.some((keyword) =>
//       currentMessage.toLowerCase().includes(keyword)
//     );

//     if (isTransient) {
//       const timer = setTimeout(() => {
//         setYoutubeStatusMessage(""); // Hapus pesan setelah 4 detik
//       }, 4000);
//       return () => clearTimeout(timer);
//     }
//   }, [youtubeStatusMessage]);

//   // Efek untuk menangani parameter URL dari callback OAuth YouTube
//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const linked = queryParams.get("youtube_linked");
//     const errorMsgParam = queryParams.get("error");
//     const successMsgParam = queryParams.get("message");

//     if (linked) {
//       // Jika ada parameter 'youtube_linked'
//       if (linked === "true") {
//         const successText =
//           successMsgParam || "Akun YouTube berhasil terhubung!";
//         // toast.success(successText);
//         setYoutubeStatusMessage(successText); // Tampilkan pesan sementara
//       } else if (linked === "false") {
//         const decodedErrorMsg = errorMsgParam
//           ? decodeURIComponent(errorMsgParam)
//           : "Gagal menghubungkan akun YouTube.";
//         toast.error(decodedErrorMsg);
//         setYoutubeStatusMessage(`Gagal: ${decodedErrorMsg}`); // Tampilkan pesan sementara
//       }
//       fetchProfileData(false); // Selalu refresh data profil setelah callback, tanpa loading besar
//       navigate(location.pathname, { replace: true }); // Hapus query params dari URL
//     }
//   }, [location, navigate, fetchProfileData]);

//   const handleEditProfile = useCallback(() => {
//     navigate("/profile/edit");
//   }, [navigate]);

//   /**
//    * Memulai proses penghapusan akun setelah konfirmasi.
//    */
//   const executeDeleteAccount = useCallback(async () => {
//     // Dialog konfirmasi sekarang ada di View, presenter hanya mengeksekusi.
//     setIsDeleting(true);
//     const toastId = toast.loading("Menghapus Akun...");

//     try {
//       await deleteMyAccountApi();
//       toast.update(toastId, {
//         render: "Akun Anda telah berhasil dihapus.",
//         type: "success",
//         isLoading: false,
//         autoClose: 3000,
//       });

//       // PERBAIKAN: Panggil fungsi logout dari AuthContext dengan benar
//       if (authContext && typeof authContext.logout === "function") {
//         authContext.logout();
//       } else {
//         // Fallback jika context tidak tersedia
//         localStorage.removeItem("jwtToken"); // Atau nama token Anda
//       }

//       navigate("/"); // Langsung arahkan ke halaman utama/login
//     } catch (err) {
//       const errorMessage = err.message || "Gagal menghapus akun. Coba lagi.";
//       toast.update(toastId, {
//         render: errorMessage,
//         type: "error",
//         isLoading: false,
//         autoClose: 5000,
//       });
//     } finally {
//       setIsDeleting(false);
//     }
//   }, [navigate, authContext]); // Tambahkan authContext sebagai dependensi

//   /**
//    * Memulai alur otorisasi YouTube dengan mengarahkan pengguna ke Google.
//    */
//   const handleConnectYouTubeAccount = useCallback(async () => {
//     setIsConnectingYouTube(true);
//     setYoutubeStatusMessage("Mengarahkan ke Google untuk otorisasi...");
//     try {
//       // API ini akan mengembalikan JSON berisi { data: { redirectUrl: '...' } }
//       const response = await initiateYoutubeOAuthRedirectApi();
//       if (response && response.data && response.data.redirectUrl) {
//         window.location.href = response.data.redirectUrl; // Redirect ke halaman otorisasi Google
//       } else {
//         throw new Error("URL otorisasi tidak diterima dari server.");
//       }
//     } catch (err) {
//       console.error("Error di handleConnectYouTubeAccount:", err);
//       const errorText = err.message || "Gagal memulai koneksi ke YouTube.";
//       setYoutubeStatusMessage(`Gagal: ${errorText}`);
//       toast.error(errorText);
//       setIsConnectingYouTube(false);
//     }
//   }, []); // Tidak ada dependensi

//   /**
//    * Memulai proses pemutusan koneksi akun YouTube.
//    */
//   const handleDisconnectYouTubeAccount = useCallback(async () => {
//     const confirmResult = await Swal.fire({
//       title: "Putuskan Hubungan Akun?",
//       text: "Anda akan memutuskan hubungan akun YouTube Anda. Anda bisa menghubungkannya kembali nanti.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Ya, putuskan!",
//       cancelButtonText: "Batal",
//     });

//     if (!confirmResult.isConfirmed) return;

//     setIsDisconnectingYouTube(true);
//     const toastId = toast.loading("Memutuskan Koneksi...");

//     try {
//       const response = await disconnectYoutubeAccountApi();
//       if (response && response.success) {
//         const successMsg =
//           response.message || "Akun YouTube berhasil diputuskan.";
//         toast.update(toastId, {
//           render: successMsg,
//           type: "success",
//           isLoading: false,
//           autoClose: 3000,
//         });
//         setYoutubeStatusMessage(successMsg); // Set pesan sementara
//         await fetchProfileData(false); // Refresh data profil untuk update UI
//       } else {
//         throw new Error(
//           response?.message || "Gagal memutuskan koneksi dari server."
//         );
//       }
//     } catch (err) {
//       const errorMsg = err.message || "Gagal memutuskan koneksi. Coba lagi.";
//       toast.update(toastId, {
//         render: errorMsg,
//         type: "error",
//         isLoading: false,
//         autoClose: 5000,
//       });
//       setYoutubeStatusMessage(`Gagal: ${errorMsg}`);
//     } finally {
//       setIsDisconnectingYouTube(false);
//     }
//   }, [fetchProfileData]); // Tambahkan fetchProfileData sebagai dependensi

//   // Mengembalikan semua state dan handler yang dibutuhkan oleh View
//   return {
//     user,
//     isLoading,
//     fetchError,
//     isDeleting,
//     handleEditProfile,
//     executeDeleteAccount,

//     // Menggunakan !!user?.youtubeChannelId untuk memastikan nilai boolean
//     isYoutubeConnected: !!user?.youtubeChannelId,
//     // Mengembalikan objek info channel jika ada, jika tidak null
//     youtubeChannelInfo:
//       user && user.youtubeChannelId
//         ? {
//             name: user.youtubeChannelName,
//             thumbnailUrl: user.youtubeChannelThumbnail,
//           } // Asumsi ada field thumbnail
//         : null,

//     isConnectingYouTube,
//     isDisconnectingYouTube,
//     youtubeStatusMessage,
//     handleConnectYouTubeAccount,
//     handleDisconnectYouTubeAccount,
//   };
// };

//============================================================================
import { useState, useEffect, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

// Impor fungsi API dan AuthContext
import {
  deleteMyAccountApi,
  initiateYoutubeOAuthRedirectApi,
  disconnectYoutubeAccountApi,
} from "../../services/api"; // Pastikan path ini benar
import { AuthContext } from "../../contexts/AuthContext"; // Pastikan path ini benar

/**
 * Presenter (sebagai custom hook) untuk mengelola semua logika dan state
 * yang terkait dengan halaman profil pengguna.
 * Menggunakan AuthContext sebagai "single source of truth" untuk data pengguna.
 */
export const useProfilePresenter = () => {
  // 1. Dapatkan semua state dan fungsi yang dibutuhkan dari AuthContext.
  // Ini menjadi sumber data utama.
  const {
    currentUser,
    isLoadingAuth, // Status loading dari context
    logout,
    refreshUser,
  } = useContext(AuthContext);

  // 2. State lokal HANYA untuk aksi spesifik di halaman ini
  const [isActionLoading, setIsActionLoading] = useState(false); // Satu state loading untuk semua aksi di halaman ini
  const [actionError, setActionError] = useState(null); // Error spesifik dari aksi di halaman ini

  const [youtubeStatusMessage, setYoutubeStatusMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // PERBAIKAN: Hilangkan state `user` dan `fetchError` lokal.
  // Kita akan menggunakan `contextUser` dan `contextError` langsung dari context.
  // const [user, setUser] = useState(contextUser);
  // const [isLoading, setIsLoading] = useState(!contextUser);
  // const [fetchError, setFetchError] = useState(null);

  // Efek untuk menangani pesan status sementara dari operasi YouTube
  useEffect(() => {
    const transientKeywords = [
      "berhasil",
      "gagal",
      "diputuskan",
      "mengarahkan",
    ];
    const currentMessage = youtubeStatusMessage || "";
    const isTransient = transientKeywords.some((keyword) =>
      currentMessage.toLowerCase().includes(keyword)
    );

    if (isTransient) {
      const timer = setTimeout(() => {
        setYoutubeStatusMessage(""); // Hapus pesan setelah 4 detik
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [youtubeStatusMessage]);

  // Efek untuk menangani parameter URL dari callback OAuth YouTube
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const linked = queryParams.get("youtube_linked");

    if (linked) {
      const errorMsgParam = queryParams.get("error");
      const successMsgParam = queryParams.get("message");

      // Setelah callback, selalu panggil `refreshUser` untuk memastikan
      // state global dan localStorage terupdate dengan data terbaru.
      refreshUser().then(() => {
        if (linked === "true") {
          toast.success(successMsgParam || "Akun YouTube berhasil terhubung!");
          setYoutubeStatusMessage(successMsgParam || "Berhasil terhubung!");
        } else if (linked === "false") {
          const decodedErrorMsg = errorMsgParam
            ? decodeURIComponent(errorMsgParam)
            : "Gagal menghubungkan akun YouTube.";
          toast.error(decodedErrorMsg);
          setYoutubeStatusMessage(`Gagal: ${decodedErrorMsg}`);
        }
      });

      // Hapus query params dari URL setelah diproses
      navigate(location.pathname, { replace: true });
    }
    // PERBAIKAN: Dependensi yang benar dan stabil
  }, [location.search, location.pathname, navigate, refreshUser]);

  // Handler untuk navigasi ke halaman edit profil
  const handleEditProfile = useCallback(() => {
    navigate("/profile/edit");
  }, [navigate]);

  /**
   * Mengeksekusi proses penghapusan akun setelah konfirmasi.
   */
  const executeDeleteAccount = useCallback(async () => {
    const confirmResult = await Swal.fire({
      title: "Anda yakin?",
      text: "Akun Anda akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus akun saya!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setIsActionLoading(true); // Gunakan state loading aksi
    const toastId = toast.loading("Menghapus Akun...");

    try {
      await deleteMyAccountApi();
      toast.update(toastId, {
        render: "Akun Anda telah berhasil dihapus.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      logout(); // Panggil fungsi logout dari context
      // Navigasi sudah ditangani oleh fungsi logout di context
    } catch (err) {
      const errorMessage = err.message || "Gagal menghapus akun.";
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  }, [logout]); // Dependensi hanya logout

  /**
   * Memulai alur otorisasi YouTube.
   */
  const handleConnectYouTubeAccount = useCallback(async () => {
    setIsActionLoading(true); // Gunakan state loading aksi
    setYoutubeStatusMessage("Mengarahkan ke Google untuk otorisasi...");
    try {
      const response = await initiateYoutubeOAuthRedirectApi();
      if (response?.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error("URL otorisasi tidak diterima dari server.");
      }
    } catch (err) {
      const errorText = err.message || "Gagal memulai koneksi ke YouTube.";
      setYoutubeStatusMessage(`Gagal: ${errorText}`);
      toast.error(errorText);
      setIsActionLoading(false);
    }
  }, []);

  /**
   * Memulai proses pemutusan koneksi akun YouTube.
   */
  const handleDisconnectYouTubeAccount = useCallback(async () => {
    const confirmResult = await Swal.fire({
      title: "Putuskan Hubungan Akun?",
      text: "Anda akan memutuskan hubungan akun YouTube Anda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, putuskan!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setIsActionLoading(true); // Gunakan state loading aksi
    const toastId = toast.loading("Memutuskan Koneksi...");

    try {
      await disconnectYoutubeAccountApi();
      const successMsg = "Akun YouTube berhasil diputuskan.";
      toast.update(toastId, {
        render: successMsg,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setYoutubeStatusMessage(successMsg);
      await refreshUser(); // Panggil refreshUser untuk mendapatkan state user terbaru
    } catch (err) {
      const errorMsg = err.message || "Gagal memutuskan koneksi.";
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setYoutubeStatusMessage(`Gagal: ${errorMsg}`);
    } finally {
      setIsActionLoading(false);
    }
  }, [refreshUser]);

  // Mengembalikan semua state dan handler yang dibutuhkan oleh View
  return {
    // Gunakan data langsung dari context sebagai sumber kebenaran
    user: currentUser,
    // Loading jika context sedang memuat user ATAU ada aksi lokal berjalan
    isLoading: isLoadingAuth,
    // Error jika ada error dari context ATAU dari aksi lokal
    fetchError: currentUser || actionError,

    // State spesifik untuk aksi di halaman ini
    isDeleting: isActionLoading, // Bisa disamakan dengan isLoading, atau dibuat terpisah jika perlu
    isConnectingYouTube: isActionLoading,
    isDisconnectingYouTube: isActionLoading,

    // Handler dan state lain
    handleEditProfile,
    executeDeleteAccount,
    isYoutubeConnected: !!currentUser?.youtubeChannelId,
    youtubeChannelInfo:
      currentUser && currentUser.youtubeChannelId
        ? {
            name: currentUser.youtubeChannelName,
            thumbnailUrl: currentUser.youtubeChannelThumbnail,
          }
        : null,
    youtubeStatusMessage,
    handleConnectYouTubeAccount,
    handleDisconnectYouTubeAccount,
  };
};
