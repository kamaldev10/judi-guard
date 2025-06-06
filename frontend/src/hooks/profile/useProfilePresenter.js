// src/hooks/profile/useUserProfilePresenter.js

import { useState, useEffect, useCallback, useContext } from "react"; // Tambahkan useContext
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  getCurrentUserApi,
  deleteMyAccountApi,
  initiateYoutubeOAuthRedirectApi,
  disconnectYoutubeAccountApi,
} from "../../services/api"; // Sesuaikan path jika perlu
import { AuthContext } from "../../contexts/AuthContext"; // Impor AuthContext Anda

/**
 * Presenter (sebagai custom hook) untuk mengelola semua logika dan state
 * yang terkait dengan halaman profil pengguna.
 */
export const useProfilePresenter = () => {
  // State lokal untuk data profil
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State spesifik untuk operasi YouTube
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [isDisconnectingYouTube, setIsDisconnectingYouTube] = useState(false);
  const [youtubeStatusMessage, setYoutubeStatusMessage] = useState("");

  // Menggunakan hooks dari React Router
  const navigate = useNavigate();
  const location = useLocation();

  // Menggunakan AuthContext untuk logout
  const authContext = useContext(AuthContext);

  /**
   * Mengambil data profil pengguna terbaru dari server.
   * @param {boolean} [showLoadingIndicator=true] - Apakah akan menampilkan state loading utama.
   */
  const fetchProfileData = useCallback(
    async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) setIsLoading(true);
      setFetchError(null);
      try {
        const responseData = await getCurrentUserApi();
        // Asumsi API mengembalikan { status: "success", data: { user } }
        if (
          responseData &&
          responseData.status === "success" &&
          responseData.data?.user
        ) {
          setUser(responseData.data.user);
        } else {
          throw new Error(
            responseData?.message ||
              "Gagal memuat data pengguna: Format tidak valid."
          );
        }
      } catch (err) {
        console.error("[useProfilePresenter] Fetch Profile Error:", err);
        const errorMessage =
          err.message || "Terjadi kesalahan saat mengambil data profil.";
        setFetchError(new Error(errorMessage));

        // PERBAIKAN KRUSIAL: Jika error adalah 401/403, token tidak valid. Lakukan logout.
        // Ini akan mengatasi error "Pengguna yang terkait dengan token ini sudah tidak ada lagi."
        // dengan membersihkan sesi yang salah.
        // Pengecekan 'err.response' mungkin tidak ada jika error berasal dari `throw new Error` di atas.
        // Kita perlu cara yang lebih andal atau menangani pesan error spesifik.
        const isAuthError =
          err.message.toLowerCase().includes("tidak login") ||
          err.message.toLowerCase().includes("sesi anda telah berakhir") ||
          err.message.toLowerCase().includes("tidak ada lagi");

        if (isAuthError) {
          // Panggil fungsi logout dari context untuk membersihkan state global dan token
          authContext.logout();
          navigate("/"); // Arahkan ke halaman utama/login
          toast.error("Sesi Anda tidak valid. Silakan login kembali.");
        }
      } finally {
        if (showLoadingIndicator) setIsLoading(false);
      }
    },
    [navigate, authContext]
  ); // Tambahkan authContext sebagai dependensi jika ada

  // Efek untuk mengambil data profil saat komponen pertama kali dimuat
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // Efek untuk menangani pesan status sementara dari operasi YouTube (callback atau aksi)
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
    const errorMsgParam = queryParams.get("error");
    const successMsgParam = queryParams.get("message");

    if (linked) {
      // Jika ada parameter 'youtube_linked'
      if (linked === "true") {
        const successText =
          successMsgParam || "Akun YouTube berhasil terhubung!";
        toast.success(successText);
        setYoutubeStatusMessage(successText); // Tampilkan pesan sementara
      } else if (linked === "false") {
        const decodedErrorMsg = errorMsgParam
          ? decodeURIComponent(errorMsgParam)
          : "Gagal menghubungkan akun YouTube.";
        toast.error(decodedErrorMsg);
        setYoutubeStatusMessage(`Gagal: ${decodedErrorMsg}`); // Tampilkan pesan sementara
      }
      fetchProfileData(false); // Selalu refresh data profil setelah callback, tanpa loading besar
      navigate(location.pathname, { replace: true }); // Hapus query params dari URL
    }
  }, [location, navigate, fetchProfileData]);

  const handleEditProfile = useCallback(() => {
    navigate("/profile/edit");
  }, [navigate]);

  /**
   * Memulai proses penghapusan akun setelah konfirmasi.
   */
  const executeDeleteAccount = useCallback(async () => {
    // Dialog konfirmasi sekarang ada di View, presenter hanya mengeksekusi.
    setIsDeleting(true);
    const toastId = toast.loading("Menghapus Akun...");

    try {
      await deleteMyAccountApi();
      toast.update(toastId, {
        render: "Akun Anda telah berhasil dihapus.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // PERBAIKAN: Panggil fungsi logout dari AuthContext dengan benar
      if (authContext && typeof authContext.logout === "function") {
        authContext.logout();
      } else {
        // Fallback jika context tidak tersedia
        localStorage.removeItem("jwtToken"); // Atau nama token Anda
      }

      navigate("/"); // Langsung arahkan ke halaman utama/login
    } catch (err) {
      const errorMessage = err.message || "Gagal menghapus akun. Coba lagi.";
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [navigate, authContext]); // Tambahkan authContext sebagai dependensi

  /**
   * Memulai alur otorisasi YouTube dengan mengarahkan pengguna ke Google.
   */
  const handleConnectYouTubeAccount = useCallback(async () => {
    setIsConnectingYouTube(true);
    setYoutubeStatusMessage("Mengarahkan ke Google untuk otorisasi...");
    try {
      // API ini akan mengembalikan JSON berisi { data: { redirectUrl: '...' } }
      const response = await initiateYoutubeOAuthRedirectApi();
      if (response && response.data && response.data.redirectUrl) {
        window.location.href = response.data.redirectUrl; // Redirect ke halaman otorisasi Google
      } else {
        throw new Error("URL otorisasi tidak diterima dari server.");
      }
    } catch (err) {
      console.error("Error di handleConnectYouTubeAccount:", err);
      const errorText = err.message || "Gagal memulai koneksi ke YouTube.";
      setYoutubeStatusMessage(`Gagal: ${errorText}`);
      toast.error(errorText);
      setIsConnectingYouTube(false);
    }
  }, []); // Tidak ada dependensi

  /**
   * Memulai proses pemutusan koneksi akun YouTube.
   */
  const handleDisconnectYouTubeAccount = useCallback(async () => {
    const confirmResult = await Swal.fire({
      title: "Putuskan Hubungan Akun?",
      text: "Anda akan memutuskan hubungan akun YouTube Anda. Anda bisa menghubungkannya kembali nanti.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, putuskan!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setIsDisconnectingYouTube(true);
    const toastId = toast.loading("Memutuskan Koneksi...");

    try {
      const response = await disconnectYoutubeAccountApi();
      if (response && response.success) {
        const successMsg =
          response.message || "Akun YouTube berhasil diputuskan.";
        toast.update(toastId, {
          render: successMsg,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setYoutubeStatusMessage(successMsg); // Set pesan sementara
        await fetchProfileData(false); // Refresh data profil untuk update UI
      } else {
        throw new Error(
          response?.message || "Gagal memutuskan koneksi dari server."
        );
      }
    } catch (err) {
      const errorMsg = err.message || "Gagal memutuskan koneksi. Coba lagi.";
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setYoutubeStatusMessage(`Gagal: ${errorMsg}`);
    } finally {
      setIsDisconnectingYouTube(false);
    }
  }, [fetchProfileData]); // Tambahkan fetchProfileData sebagai dependensi

  // Mengembalikan semua state dan handler yang dibutuhkan oleh View
  return {
    user,
    isLoading,
    fetchError,
    isDeleting,
    handleEditProfile,
    executeDeleteAccount,

    // Menggunakan !!user?.youtubeChannelId untuk memastikan nilai boolean
    isYoutubeConnected: !!user?.youtubeChannelId,
    // Mengembalikan objek info channel jika ada, jika tidak null
    youtubeChannelInfo:
      user && user.youtubeChannelId
        ? {
            name: user.youtubeChannelName,
            thumbnailUrl: user.youtubeChannelThumbnail,
          } // Asumsi ada field thumbnail
        : null,

    isConnectingYouTube,
    isDisconnectingYouTube,
    youtubeStatusMessage,
    handleConnectYouTubeAccount,
    handleDisconnectYouTubeAccount,
  };
};
