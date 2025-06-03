// File: src/hooks/useUserProfilePresenter.js

import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Tetap diimpor untuk konfirmasi
import { toast } from "react-toastify"; // Sudah diimpor

import {
  getCurrentUserApi,
  deleteMyAccountApi,
  initiateYoutubeOAuthRedirectApi,
  disconnectYoutubeAccountApi,
} from "../../services/api";

export const useProfilePresenter = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [isDisconnectingYouTube, setIsDisconnectingYouTube] = useState(false);
  const [youtubeStatusMessage, setYoutubeStatusMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const fetchProfileData = useCallback(
    async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) setIsLoading(true);
      setFetchError(null);
      try {
        const responseData = await getCurrentUserApi();
        if (
          responseData &&
          responseData.status === "success" &&
          responseData.data &&
          responseData.data.user
        ) {
          const fetchedUser = responseData.data.user;
          // console.log("====================================================");
          // console.log(
          //   "[useProfilePresenter] Refreshed user data from /users/me:",
          //   JSON.stringify(fetchedUser, null, 2)
          // );
          // console.log(
          //   "isYoutubeConnected from refreshed data:",
          //   fetchedUser.isYoutubeConnected
          // );
          // console.log(
          //   "youtubeChannelName from refreshed data:",
          //   fetchedUser.youtubeChannelName
          // );
          // console.log("====================================================");
          setUser(fetchedUser);
        } else {
          throw new Error(
            responseData?.message ||
              "Gagal memuat data pengguna: Format tidak valid."
          );
        }
      } catch (err) {
        setFetchError(
          new Error(
            err.response?.data?.message || // Ambil pesan dari backend jika ada
              err.message ||
              "Terjadi kesalahan saat mengambil data profil."
          )
        );
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          localStorage.removeItem("judiGuardToken");
          // Mengganti Swal dengan toast untuk notifikasi sesi berakhir
          toast.error(
            "Sesi Anda telah berakhir atau tidak valid. Silakan login kembali.",
            {
              position: "top-center",
              autoClose: 3500,
              onClose: () => navigate("/login"), // Navigasi setelah toast ditutup atau otomatis tertutup
            }
          );
        }
      } finally {
        if (showLoadingIndicator) setIsLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    if (user) {
      const transientMessages = [
        "berhasil",
        "gagal",
        "diputuskan",
        "mengarahkan",
      ]; // Tambahkan "mengarahkan"
      const currentMessageIsTransient = transientMessages.some((keyword) =>
        (youtubeStatusMessage || "").toLowerCase().includes(keyword)
      );

      if (currentMessageIsTransient) {
        const timer = setTimeout(() => {
          // Hanya reset jika masih pesan transient, untuk menghindari menghapus pesan status permanen
          if (
            transientMessages.some((keyword) =>
              (youtubeStatusMessage || "").toLowerCase().includes(keyword)
            )
          ) {
            setYoutubeStatusMessage("");
          }
        }, 4000);
        return () => clearTimeout(timer);
      }

      // Setelah pesan transient hilang (atau jika tidak pernah ada)
      // atau jika user berubah dan pesan bukan transient
      if (user.isYoutubeConnected) {
        setYoutubeStatusMessage(
          `Terhubung ke channel: ${user.youtubeChannelName || "Channel YouTube"}`
        );
      } else {
        // Hanya set jika belum ada pesan transient aktif
        if (!currentMessageIsTransient) {
          setYoutubeStatusMessage("Akun YouTube belum terhubung.");
        }
      }
    } else if (!isLoading && !fetchError) {
      setYoutubeStatusMessage("Akun YouTube belum terhubung.");
    }
  }, [user, isLoading, fetchError, youtubeStatusMessage]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const linked = queryParams.get("youtube_linked");
    const errorMsgParam = queryParams.get("error");
    const successMsgParam = queryParams.get("message");

    let needsProfileRefresh = false;
    let clearUrlParams = false;

    if (linked === "true") {
      const successText =
        successMsgParam || "Akun YouTube Anda berhasil terhubung.";
      setYoutubeStatusMessage(successText);
      // Mengganti Swal dengan toast
      toast.success(successText, {
        position: "top-end",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      needsProfileRefresh = true;
      clearUrlParams = true;
    } else if (linked === "false") {
      const decodedErrorMsg = errorMsgParam
        ? decodeURIComponent(errorMsgParam)
        : "Gagal menghubungkan akun YouTube.";
      setYoutubeStatusMessage(`Gagal: ${decodedErrorMsg}`);
      // Mengganti Swal dengan toast
      toast.error(decodedErrorMsg, {
        position: "top-center", // Mungkin lebih baik di tengah untuk error penting
      });
      needsProfileRefresh = true;
      clearUrlParams = true;
    }

    if (needsProfileRefresh) {
      fetchProfileData(false);
    }

    if (clearUrlParams) {
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate, fetchProfileData]); // fetchProfileData ditambahkan ke dependensi oleh ESLint, pastikan stabil

  const handleEditProfile = useCallback(() => {
    navigate("/profile/edit");
  }, [navigate]);

  const executeDeleteAccount = useCallback(async () => {
    // --- DIALOG KONFIRMASI: TETAP MENGGUNAKAN SWAL ---
    // react-toastify tidak cocok untuk dialog konfirmasi Ya/Tidak yang blocking.
    const confirmResult = await Swal.fire({
      title: "Anda yakin?",
      text: "Akun Anda akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus akun!",
      cancelButtonText: "Batal",
      // customClass: { popup: "rounded-xl shadow-lg text-sm" }, // customClass tidak berlaku untuk toast
    });

    if (!confirmResult.isConfirmed) return;

    setIsDeleting(true);
    // Mengganti Swal loading dengan toast.loading
    const toastId = toast.loading("Menghapus Akun... Mohon tunggu sebentar.");

    try {
      await deleteMyAccountApi();
      // Mengupdate toast menjadi sukses
      toast.update(toastId, {
        render: "Akun Anda telah berhasil dihapus.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        // position: "top-center", // Opsional
      });
      localStorage.removeItem("judiGuardToken");
      setUser(null);
      // Pertimbangkan untuk memanggil fungsi logout dari AuthContext di sini jika ada
      // agar state global juga terupdate.
      navigate("/login"); // Arahkan ke login setelah sukses hapus
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal menghapus akun. Silakan coba lagi.";
      // Mengupdate toast menjadi error
      toast.update(toastId, {
        render: errorMessage,
        type: "error",
        isLoading: false,
        autoClose: 5000, // Biarkan pesan error tampil lebih lama
        // position: "top-center",
      });
    } finally {
      setIsDeleting(false);
      // toast.dismiss(toastId) tidak selalu diperlukan jika autoClose atau update sudah menutupnya.
      // Namun, jika ingin memastikan, bisa saja ditambahkan.
      // Untuk loading yang diupdate, isLoading: false akan menutupnya.
    }
  }, [navigate]); // Tambahkan dependensi lain jika ada (misal, fungsi logout dari context)

  const handleConnectYouTubeAccount = useCallback(async () => {
    setIsConnectingYouTube(true);
    setYoutubeStatusMessage("Mengarahkan ke Google untuk otorisasi...");
    try {
      const response = await initiateYoutubeOAuthRedirectApi();
      // console.log("==============================================");
      // console.log("RAW RESPONSE from initiateYoutubeOAuthRedirectApi:", response);
      // try { console.log("RAW RESPONSE (JSON.stringify):", JSON.stringify(response, null, 2)); } catch (e) { console.error("Gagal stringify:", e); }
      // console.log("==============================================");

      if (response && response.data && response.data.redirectUrl) {
        // console.log("Kondisi redirectUrl TERPENUHI.");
        // console.log("redirectUrl yang diterima:", response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
        // Tidak perlu toast sukses di sini karena halaman akan berganti
      } else {
        // console.error("Kondisi redirectUrl TIDAK TERPENUHI.");
        // console.error("Detail: 'response' ada?", !!response);
        // if (response) { console.error("Detail: 'response.data' ada?", !!response.data);
        //   if (response.data) { console.error("Detail: 'response.data.redirectUrl' ada?", !!response.data.redirectUrl, "Nilainya:", response.data.redirectUrl); }
        // }
        throw new Error(
          "URL otorisasi tidak diterima dari server (debug: redirectUrl tidak ditemukan atau struktur respons salah)."
        );
      }
    } catch (err) {
      console.error("Error di handleConnectYouTubeAccount (catch block):", err);
      const errorText =
        err.response?.data?.message ||
        err.message ||
        "Gagal memulai koneksi ke YouTube.";

      setYoutubeStatusMessage(`Gagal: ${errorText}`);
      // Mengganti Swal dengan toast
      toast.error(errorText);
      setIsConnectingYouTube(false);
    }
  }, []);

  const handleDisconnectYouTubeAccount = useCallback(async () => {
    // --- DIALOG KONFIRMASI: TETAP MENGGUNAKAN SWAL ---
    const confirmResult = await Swal.fire({
      title: "Anda yakin?",
      text: "Anda akan memutuskan hubungan akun YouTube Anda.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, putuskan!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) return;

    setIsDisconnectingYouTube(true);
    setYoutubeStatusMessage("Memutuskan koneksi...");

    // Mengganti Swal loading dengan toast.loading
    const toastId = toast.loading("Memutuskan Koneksi...");

    try {
      const response = await disconnectYoutubeAccountApi(); // Ini adalah fungsi API Anda
      if (response && response.success) {
        const successMsg =
          response.message || "Akun YouTube berhasil diputuskan.";
        setYoutubeStatusMessage(successMsg);
        // Mengupdate toast menjadi sukses
        toast.update(toastId, {
          render: successMsg,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        await fetchProfileData(false); // Refresh data pengguna
      } else {
        throw new Error(
          response?.error ||
            response?.message ||
            "Gagal memutuskan koneksi dari server."
        );
      }
    } catch (err) {
      const errorMsg =
        err.message || "Gagal memutuskan koneksi. Silakan coba lagi.";
      setYoutubeStatusMessage(`Gagal: ${errorMsg}`);
      // Mengupdate toast menjadi error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsDisconnectingYouTube(false);
    }
  }, [fetchProfileData]);

  return {
    user,
    isLoading,
    fetchError,
    isDeleting,
    handleEditProfile,
    executeDeleteAccount,

    isYoutubeConnected: user?.isYoutubeConnected || false,
    youtubeChannelInfo: user?.youtubeChannelInfo || null,
    // youtubeChannelId: user?.youtubeChannelId || null,
    // youtubeChannelName: user?.youtubeChannelName || null, // Jika Anda memilih mengirim ini dari presenter

    isConnectingYouTube,
    isDisconnectingYouTube,
    youtubeStatusMessage,
    handleConnectYouTubeAccount,
    handleDisconnectYouTubeAccount,
  };
};
