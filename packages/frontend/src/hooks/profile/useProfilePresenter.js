import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import {
  disconnectYoutubeAccountApi,
  initiateYoutubeOAuthRedirectApi,
} from "@/lib/services";
import { useAuthStore } from "@/stores/auth/authStore";
import { useUserStore } from "@/stores";

/**
 * Presenter (sebagai custom hook) untuk mengelola semua logika dan state
 * yang terkait dengan halaman profil pengguna.
 * Menggunakan useAuthStore sebagai "single source of truth" untuk data pengguna.
 */
export const useProfilePresenter = () => {
  const { currentUser, isLoadingAuth, logout, refreshUser } = useAuthStore();

  const [isActionLoading, setIsActionLoading] = useState(false); // Satu state loading untuk semua aksi di halaman ini
  const [actionError, setActionError] = useState(null); // Error spesifik dari aksi di halaman ini

  const [youtubeStatusMessage, setYoutubeStatusMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const { deleteAccount } = useUserStore();

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
          // toast.success(successMsgParam || "Akun YouTube berhasil terhubung!");
          setYoutubeStatusMessage(successMsgParam || "Berhasil terhubung!");
        } else if (linked === "false") {
          const decodedErrorMsg = errorMsgParam
            ? decodeURIComponent(errorMsgParam)
            : "Gagal menghubungkan akun YouTube.";
          toast.error(decodedErrorMsg);
          setYoutubeStatusMessage(`Gagal: ${decodedErrorMsg}`);
        }
      });

      navigate(location.pathname, { replace: true });
    }
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
    const toastMsg = toast.loading("Menghapus Akun...");

    try {
      await deleteAccount;
      toast.update(toastMsg, {
        render: "Akun Anda telah berhasil dihapus.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      navigate("/");
    } catch (err) {
      const errorMessage = err.message || "Gagal menghapus akun.";
      toast.update(toastMsg, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      setActionError(errorMessage);
    } finally {
      setIsActionLoading(false);
    }
  });

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
