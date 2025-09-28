/* eslint-disable react-hooks/exhaustive-deps */
// src/hooks/useVideoAnalysis.js
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import {
  submitVideoForAnalysisApi,
  getVideoAnalysisApi,
  getAnalyzedCommentsApi,
  // batchDeleteJudiCommentsApi,
  deleteSingleCommentApi,
  getStudioLinkApi,
  getCurrentUserApi,
} from "@/lib/services";
import { validateYoutubeUrl } from "@/lib/utils/form-validators";

// Interval untuk polling status analisis (dalam milidetik)
const POLLING_INTERVAL = 5000; // 5 detik

/**
 * Custom hook untuk mengelola logika dan state terkait analisis video YouTube.
 * Mencakup pengambilan data pengguna, submit video untuk analisis, polling status,
 * pengambilan hasil komentar, dan aksi penghapusan komentar (batch dan tunggal).
 */
export const useVideoAnalysis = () => {
  // State untuk data pengguna dan status koneksi YouTube
  const [currentUser, setCurrentUser] = useState(null);
  const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
  const [authError, setAuthError] = useState(null); // Menyimpan error saat fetch data pengguna
  const [isUserLoading, setIsUserLoading] = useState(true); // Status loading data pengguna

  // State untuk input form dan proses analisis/aksi
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Indikator loading umum untuk operasi API yang singkat atau tidak spesifik
  const [isAnalyzing, setIsAnalyzing] = useState(false); // True saat proses analisis & polling utama aktif
  const [isDeleting, setIsDeleting] = useState(false); // True saat proses penghapusan (batch atau tunggal) aktif

  // State untuk hasil analisis
  const [analysisId, setAnalysisId] = useState(null); // ID dari VideoAnalysis yang sedang/telah diproses
  const [videoAnalysisData, setVideoAnalysisData] = useState(null); // Metadata dan status dari VideoAnalysis (objek dari backend)
  const [analyzedComments, setAnalyzedComments] = useState([]); // Array daftar komentar yang telah dianalisis

  // State turunan untuk UI (chart dan statistik)
  const [pieChartData, setPieChartData] = useState([]);
  const [stats, setStats] = useState({ total: 0, JUDI: 0, NON_JUDI: 0 }); // Pastikan key (JUDI, NON_JUDI) konsisten dengan enum backend dan PIE_CHART_COLORS
  const [pollingMessage, setPollingMessage] = useState(""); // Pesan yang ditampilkan selama polling atau proses panjang

  // Efek untuk mengambil data pengguna saat hook pertama kali dimuat
  useEffect(() => {
    const fetchUser = async () => {
      setIsUserLoading(true);
      setAuthError(null);
      try {
        const backendResponse = await getCurrentUserApi(); // Mengembalikan { status, message, data: { user } }
        if (
          backendResponse &&
          (backendResponse.success === true ||
            backendResponse.status === "success") &&
          backendResponse.data &&
          backendResponse.data.user
        ) {
          const userObject = backendResponse.data.user;
          setCurrentUser(userObject);
          setIsYouTubeConnected(!!userObject.youtubeChannelId); // Set status koneksi berdasarkan youtubeChannelId
        } else {
          const errorMessage =
            backendResponse?.message ||
            "Gagal memuat data pengguna (format tidak sesuai).";
          console.error(
            "Format respons /users/me tidak sesuai:",
            backendResponse
          );
          setAuthError(errorMessage);
          setCurrentUser(null);
          setIsYouTubeConnected(false);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        setAuthError(error.message); // error.message sudah diformat oleh getCurrentUserApi
        setCurrentUser(null);
        setIsYouTubeConnected(false);
      } finally {
        setIsUserLoading(false);
      }
    };
    fetchUser();
  }, []); // Dependensi kosong, hanya jalan sekali saat mount

  // Efek untuk mengupdate PieChart dan Statistik ketika `analyzedComments` berubah
  useEffect(() => {
    if (analyzedComments.length > 0) {
      const judiCount = analyzedComments.filter(
        (c) => c.classification === "JUDI"
      ).length;
      const nonJudiCount = analyzedComments.filter(
        (c) => c.classification === "NON_JUDI"
      ).length;
      // Jika ada kategori lain yang ingin dihitung dan ditampilkan, tambahkan di sini
      // const pendingCount = analyzedComments.filter(c => c.classification === "PENDING_ANALYSIS").length;
      const totalCount = analyzedComments.length;

      const newPieData = [
        { name: "Clean", value: nonJudiCount }, // Ubah "Non-Judi" menjadi "Clean"
        { name: "Spam", value: judiCount }, // Ubah "Judi" menjadi "Spam" atau "Judi"
      ].filter((item) => item.value > 0);

      setPieChartData(newPieData);
      setStats({ total: totalCount, JUDI: judiCount, NON_JUDI: nonJudiCount });
    } else {
      setPieChartData([]);
      setStats({ total: 0, JUDI: 0, NON_JUDI: 0 });
    }
  }, [analyzedComments]);

  /**
   * Mengambil daftar komentar yang telah dianalisis untuk `currentAnalysisId`.
   * @param {string} currentAnalysisId - ID dari VideoAnalysis.
   * @returns {Promise<Array>} Array komentar yang diambil, atau array kosong jika gagal.
   */
  const fetchComments = useCallback(
    async (currentAnalysisId) => {
      if (!currentAnalysisId) return [];
      // console.log(
      //   `[Frontend] fetchComments dipanggil untuk analysisId: ${currentAnalysisId}. User ID saat ini di frontend: ${currentUser?._id}`
      // );

      setIsLoading(true); // Indikator loading umum aktif
      try {
        const responseData = await getAnalyzedCommentsApi(currentAnalysisId);
        // Asumsi API service mengembalikan array komentar langsung atau objek dengan properti data: { data: [comments] }
        const comments = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];

        // --- LOGIKA SORTING DITAMBAHKAN DI SINI ---
        comments.sort((a, b) => {
          // Kriteria Utama: Klasifikasi "JUDI" selalu di atas
          const aIsJudi = a.classification === "JUDI";
          const bIsJudi = b.classification === "JUDI";

          if (aIsJudi && !bIsJudi) {
            return -1; // 'a' (yang JUDI) harus berada sebelum 'b'
          }
          if (!aIsJudi && bIsJudi) {
            return 1; // 'b' (yang JUDI) harus berada sebelum 'a'
          }

          // Kriteria Kedua: Jika kedua komentar memiliki klasifikasi yang sama (sama-sama JUDI atau sama-sama NON_JUDI),
          // urutkan berdasarkan yang terbaru (tanggal publikasi descending).
          // Kita konversi ke objek Date untuk perbandingan yang akurat.
          return (
            new Date(b.commentPublishedAt) - new Date(a.commentPublishedAt)
          );
        });
        // --- AKHIR LOGIKA SORTING ---

        setAnalyzedComments(comments);
        return comments; // Kembalikan komentar untuk digunakan langsung jika perlu (misal, di handleSubmitAnalysis)
      } catch (error) {
        Swal.fire("Error Mengambil Komentar", error.message, "error");
        setAnalyzedComments([]); // Kosongkan jika error
        return [];
      } finally {
        setIsLoading(false); // Loading umum selesai
      }
    },
    [currentUser]
  ); // Tidak ada dependensi eksternal yang sering berubah, API function stabil

  // Efek untuk polling status analisis jika backend berjalan secara asinkron
  useEffect(() => {
    let intervalId = null;

    if (
      isAnalyzing &&
      analysisId &&
      videoAnalysisData?.status === "PROCESSING" &&
      isYouTubeConnected
    ) {
      setPollingMessage(
        `Memproses analisis (Status: ${videoAnalysisData.status}). Komentar: ${videoAnalysisData.totalCommentsAnalyzed || 0}/${videoAnalysisData.totalCommentsFetched || "N/A"}`
      );
      intervalId = setInterval(async () => {
        try {
          const updatedApiResult = await getVideoAnalysisApi(analysisId);
          const updatedAnalysisData = updatedApiResult; // Jika API service mengembalikan objek langsung
          // atau updatedApiResult.data jika dibungkus lagi

          setVideoAnalysisData(updatedAnalysisData); // Update seluruh data analisis
          setPollingMessage(
            `Status: ${updatedAnalysisData.status}. Komentar terproses: ${updatedAnalysisData.totalCommentsAnalyzed || 0}/${updatedAnalysisData.totalCommentsFetched || 0}`
          );

          // Cek jika proses telah selesai (COMPLETED, FAILED, atau mengandung ERROR)
          if (
            ["COMPLETED", "FAILED"].includes(updatedAnalysisData.status) ||
            updatedAnalysisData.status?.includes("ERROR")
          ) {
            setIsAnalyzing(false); // Hentikan state isAnalyzing, yang akan menghentikan polling ini
            setPollingMessage(
              updatedAnalysisData.status === "COMPLETED"
                ? "Analisis selesai sepenuhnya."
                : `Proses analisis selesai dengan status: ${updatedAnalysisData.status}`
            );
            if (updatedAnalysisData.status === "COMPLETED") {
              await fetchComments(analysisId); // Ambil komentar final setelah analisis benar-benar selesai
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
          setPollingMessage(
            `Error saat polling: ${error.message}. Polling dihentikan.`
          );
          setIsAnalyzing(false); // Hentikan polling jika ada error
        }
      }, POLLING_INTERVAL);
    } else if (!isAnalyzing) {
      // Jika isAnalyzing di-set false dari luar (misal setelah submit sinkron)
      setPollingMessage(""); // Hapus pesan polling
      if (intervalId) clearInterval(intervalId); // Pastikan interval dibersihkan
    }

    // Cleanup function untuk membersihkan interval saat komponen unmount atau dependensi berubah
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    isAnalyzing,
    analysisId,
    videoAnalysisData,
    fetchComments,
    isYouTubeConnected,
  ]);

  /**
   * Helper function untuk memeriksa prasyarat sebelum melakukan aksi (data user, koneksi YouTube).
   * @param {string} actionNameForMessage - Nama aksi (misalnya, "memulai analisis") untuk pesan error/info.
   * @returns {boolean} True jika semua prasyarat terpenuhi dan aksi bisa dilanjutkan.
   */
  const checkPrerequisites = useCallback(
    (actionNameForMessage) => {
      if (isUserLoading) {
        Swal.fire({
          title: "Mohon Tunggu",
          text: "Sedang memverifikasi status pengguna...",
          icon: "info",
          allowOutsideClick: false,
          showConfirmButton: false,
          timer: 2500,
        });
        return false;
      }
      if (authError) {
        Swal.fire(
          "Gagal Memuat Data Pengguna",
          `Tidak dapat melanjutkan ${actionNameForMessage}. ${authError} Silakan login menggunakan akun google/youtube anda.`,
          "error"
        );
        return false;
      }
      if (!isYouTubeConnected) {
        Swal.fire(
          "Koneksi YouTube Diperlukan",
          `Untuk ${actionNameForMessage}, silakan hubungkan akun YouTube Anda di halaman profil.`,
          "warning"
        );
        // Contoh: navigate('/profil/pengaturan'); // Anda mungkin ingin fungsi navigate di sini
        return false;
      }
      return true;
    },
    [isUserLoading, authError, isYouTubeConnected]
  ); // Dependensi untuk useCallback

  /**
   * Helper function terpusat untuk menangani error API dan menampilkan notifikasi Swal.
   * @param {Error} error - Objek error yang ditangkap dari panggilan API.
   * @param {string} actionName - Nama aksi yang sedang dilakukan (misal, "Analisis Video").
   */
  const handleApiError = (error, actionName = "Analisis Video") => {
    // Axios biasanya membungkus error HTTP dalam `error.response`
    if (error.response && error.response.status === 429) {
      // Kasus Spesifik: Kuota Habis (HTTP 429 Too Many Requests)
      Swal.fire({
        icon: "error",
        title: "Kuota API Youtube Habis",
        // Gunakan pesan dari backend jika ada, atau fallback
        text:
          error.response.data?.message ||
          "Jatah penggunaan YouTube API untuk hari ini telah habis. Fitur akan tersedia kembali besok.",
        confirmButtonText: "Mengerti",
      });
    } else if (
      error.message.toLowerCase().includes("izin tidak cukup") ||
      error.message.toLowerCase().includes("otorisasi youtube")
    ) {
      // Kasus Spesifik: Masalah Izin/Otorisasi YouTube
      Swal.fire({
        icon: "warning",
        title: "Otorisasi YouTube Diperlukan",
        text: `Gagal melakukan ${actionName}. Pastikan akun YouTube Anda terhubung dengan benar dan memiliki izin yang diperlukan. Anda mungkin perlu menghubungkan ulang akun di halaman profil.`,
        confirmButtonText: "OK",
      });
    } else {
      // Kasus Error Umum Lainnya
      Swal.fire({
        icon: "error",
        title: `Oops! Terjadi Kesalahan`,
        text:
          error.message || `Gagal melakukan ${actionName}. Silakan coba lagi.`,
        confirmButtonText: "Tutup",
      });
    }
  };

  /**
   * Menangani submit URL video untuk dianalisis.
   */
  const handleSubmitAnalysis = useCallback(async () => {
    if (!checkPrerequisites("memulai analisis")) return;

    const validationError = validateYoutubeUrl(videoUrl);
    if (validationError) {
      Swal.fire("Input Tidak Valid", validationError, "warning");
      return;
    }

    setIsAnalyzing(true); // Proses analisis dimulai
    setIsLoading(true);
    setAnalyzedComments([]); // Reset hasil analisis sebelumnya
    setVideoAnalysisData(null);
    setAnalysisId(null);
    setPollingMessage("Mengirim permintaan analisis ke server...");

    Swal.fire({
      title: "Memulai Analisis...",
      text: "Video Anda sedang dikirim untuk dianalisis. Ini mungkin membutuhkan beberapa saat.",
      icon: "info",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const initialAnalysisData = await submitVideoForAnalysisApi(videoUrl);
      setVideoAnalysisData(initialAnalysisData);
      setAnalysisId(initialAnalysisData._id);

      // Periksa status dari respons awal submit
      if (initialAnalysisData.status === "COMPLETED") {
        Swal.update({
          text: `Video "${initialAnalysisData.videoTitle || "YouTube"}" telah selesai diproses. Mengambil daftar komentar...`,
        });
        const fetchedComments = await fetchComments(initialAnalysisData._id);
        // console.log("fetchedComments :", fetchedComments);
        Swal.close();
        Swal.fire(
          "Analisis Selesai!",
          `Ditemukan dan diproses ${fetchedComments.length} komentar.`,
          "success"
        );
        setIsAnalyzing(false); // Analisis dan pengambilan komentar selesai
        setPollingMessage("");
      } else if (
        ["PENDING", "PROCESSING"].includes(initialAnalysisData.status)
      ) {
        // Jika PENDING/PROCESSING, state isAnalyzing sudah true, biarkan useEffect polling yang bekerja.
        Swal.update({
          text: `Analisis untuk video "${initialAnalysisData.videoTitle || "YouTube"}" sedang berjalan (Status: ${initialAnalysisData.status}). Hasil akan diperbarui secara otomatis.`,
        });
        setPollingMessage(
          `Status: ${initialAnalysisData.status}. Menunggu penyelesaian...`
        );
        // isLoading umum bisa di-set false di sini jika polling yang akan menangani loading UI lebih lanjut
        // setIsLoading(false); // Karena isAnalyzing akan menjaga UI tetap 'sibuk'
      } else {
        // Jika status dari backend adalah FAILED atau status error lainnya saat submit awal
        Swal.close();
        throw new Error(
          initialAnalysisData.errorMessage ||
            `Analisis gagal dimulai dengan status: ${initialAnalysisData.status}`
        );
      }
    } catch (err) {
      Swal.close(); // Tutup Swal loading jika masih terbuka
      // Penanganan error otorisasi YouTube secara spesifik
      if (
        err.message.toLowerCase().includes("izin tidak cukup") ||
        err.message.toLowerCase().includes("insufficient permission") ||
        err.message.toLowerCase().includes("otorisasi youtube") ||
        err.message.toLowerCase().includes("re-link") ||
        err.message.toLowerCase().includes("token")
      ) {
        Swal.fire({
          title: "Otorisasi YouTube Gagal",
          text: "Aplikasi tidak memiliki izin atau sesi YouTube Anda bermasalah. Coba hubungkan ulang akun YouTube Anda di halaman profil.",
          icon: "error",
        });
      } else {
        Swal.fire("Error Analisis", err.message, "error");
      }

      setIsAnalyzing(false);
      setPollingMessage("");
      // Update status di videoAnalysisData jika sudah ada
      setVideoAnalysisData((prev) =>
        prev
          ? { ...prev, status: "FAILED", errorMessage: err.message }
          : { _id: null, status: "FAILED", errorMessage: err.message }
      );
    } finally {
      // isLoading umum akan di-set false ketika isAnalyzing juga false (setelah polling atau error)
      // atau jika proses submit awal langsung COMPLETED.
      if (!isAnalyzing) {
        // Jika tidak ada lagi proses polling/analisis yang berjalan
        setIsLoading(false);
      }
    }
  }, [videoUrl, checkPrerequisites, fetchComments]); // Hapus 'isAnalyzing' dari dependensi useCallback untuk handleSubmitAnalysis agar tidak memicu pendefinisian ulang saat isAnalyzing berubah di dalamnya.
  // Jika ada logika yang bergantung pada isAnalyzing *sebelum* async, ia bisa dimasukkan.

  /**
   *FITUR INI AKAN DIGUNAKAN KETIKA SUDAH DISEDIAKAN OLEH YOUTUBE DATA API
   * Menangani permintaan penghapusan semua komentar "JUDI" untuk analisis saat ini.
   */
  // const handleBatchDeleteJudiComments = useCallback(async () => {
  //   if (!checkPrerequisites("menghapus semua komentar 'JUDI'")) return;

  //   if (!analysisId) {
  //     Swal.fire(
  //       "Error",
  //       "Tidak ada ID analisis aktif untuk operasi ini.",
  //       "error"
  //     );
  //     return;
  //   }

  //   if ((stats.JUDI || 0) === 0) {
  //     Swal.fire(
  //       "Info",
  //       "Tidak ada komentar berkategori 'JUDI' yang dapat dihapus.",
  //       "info"
  //     );
  //     return;
  //   }

  //   const confirmResult = await Swal.fire({
  //     title: "Anda yakin?",
  //     text: `Semua ${stats.JUDI} komentar yang terdeteksi 'JUDI' akan dihapus dari YouTube. Tindakan ini tidak dapat diurungkan!`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     cancelButtonColor: "#3085d6",
  //     confirmButtonText: "Ya, Hapus Semua!",
  //     cancelButtonText: "Batal",
  //   });

  //   if (confirmResult.isConfirmed) {
  //     setIsDeleting(true);
  //     setIsLoading(true);
  //     setPollingMessage("Memproses penghapusan komentar 'JUDI'...");
  //     Swal.fire({
  //       title: "Menghapus Komentar...",
  //       text: 'Sedang menghapus semua komentar "JUDI"...',
  //       icon: "info",
  //       allowOutsideClick: false,
  //       didOpen: () => Swal.showLoading(),
  //     });

  //     try {
  //       const response = await batchDeleteJudiCommentsApi(analysisId);
  //       Swal.close();
  //       Swal.fire(
  //         "Proses Selesai!",
  //         `${response.message || "Operasi penghapusan selesai."} Berhasil: ${response.successfullyDeleted || 0}. Gagal: ${response.failedToDelete || 0}.`,
  //         (response.failedToDelete || 0) > 0 ? "warning" : "success"
  //       );
  //       await fetchComments(analysisId); // Refresh daftar komentar
  //     } catch (err) {
  //       Swal.close();
  //       handleApiError(err, "penghapusan komentar");

  //       if (
  //         err.message.toLowerCase().includes("otorisasi youtube") ||
  //         err.message.toLowerCase().includes("izin tidak cukup")
  //       ) {
  //         Swal.fire(
  //           "Otorisasi YouTube Gagal",
  //           "Gagal menghapus komentar. Pastikan akun YouTube Anda terhubung dengan izin yang benar.",
  //           "error"
  //         );
  //       } else {
  //         Swal.fire("Error Hapus Massal", err.message, "error");
  //       }
  //     } finally {
  //       setIsDeleting(false);
  //       setIsLoading(false);
  //       setPollingMessage("");
  //     }
  //   }
  // }, [analysisId, stats, checkPrerequisites, fetchComments]); // stats menjadi dependensi

  //FITUR INI AKAN DIGUNAKAN KETIKA SUDAH DISEDIAKAN OLEH YOUTUBE DATA API
  const handleDeleteSingleComment = useCallback(
    async (analyzedCommentId, commentText) => {
      if (!checkPrerequisites("menghapus komentar ini")) return;

      // Store original comments for rollback
      const originalComments = [...analyzedComments];
      const commentToDelete = originalComments.find(
        (c) => c._id === analyzedCommentId
      );

      if (!commentToDelete) {
        Swal.fire("Error", "Komentar tidak ditemukan.", "error");
        return;
      }

      // Optimistic update
      setAnalyzedComments((prev) =>
        prev.filter((c) => c._id !== analyzedCommentId)
      );

      try {
        const confirmResult = await Swal.fire({
          title: "Konfirmasi Penghapusan",
          html: `Yakin hapus komentar: <i>"${
            commentText.length > 100
              ? `${commentText.substring(0, 100)}...`
              : commentText
          }"</i>?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ya, Hapus",
          cancelButtonText: "Batal",
        });

        if (!confirmResult.isConfirmed) {
          setAnalyzedComments(originalComments);
          return;
        }

        setIsDeleting(true);

        // API call with enhanced error handling
        const response = await deleteSingleCommentApi(analyzedCommentId);

        if (response.error) {
          if (response.error.code === 403) {
            throw new Error(`
          Gagal menghapus: Komentar ini bukan milik akun YouTube yang terhubung.
          Silakan hubungkan akun YouTube yang benar.
        `);
          }
          throw new Error(response.error.message);
        }

        Swal.fire(
          "Berhasil!",
          `Komentar "${commentToDelete.youtubeCommentId}" berhasil dihapus dari YouTube.`,
          "success"
        );
      } catch (error) {
        // Rollback UI
        setAnalyzedComments(originalComments);

        let errorMessage = "Gagal menghapus komentar";
        let errorDetails = "";

        if (error.response?.data?.error) {
          // Handle API structured errors
          errorMessage = error.response.data.error.message;
          errorDetails = error.response.data.error.details;
        } else if (error.message.includes("Kuota")) {
          errorMessage = "Kuota API YouTube habis, coba lagi nanti";
        } else if (error.message.includes("tidak valid")) {
          errorMessage = "Format komentar tidak valid";
        } else if (error.message.includes("NOT_COMMENT_OWNER")) {
          errorMessage = "Anda bukan pemilik komentar ini";
        } else if (error.message.includes("COMMENT_NOT_FOUND")) {
          errorMessage = "Komentar sudah dihapus atau tidak ditemukan";
        }

        await Swal.fire({
          title: "Error",
          html: `${errorMessage}${errorDetails ? `<br><small>${errorDetails}</small>` : ""}`,
          icon: "error",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [analysisId, analyzedComments, checkPrerequisites, deleteSingleCommentApi]
  );

  /**
   * Menangani klik pada tombol "Kelola Komentar", yang akan menampilkan
   * popup edukatif dan mengarahkan pengguna ke YouTube Studio.
   */
  const handleManageComments = useCallback(async () => {
    if (!checkPrerequisites("mengelola komentar")) return;
    if (!analysisId) return; // Seharusnya tidak terjadi jika tombol muncul

    setIsLoading(true); // Tampilkan loading sementara mengambil link

    try {
      // 1. Ambil link YouTube Studio dari backend (langkah ini sudah benar)
      const studioUrl = await getStudioLinkApi(analysisId);

      // 2. Tampilkan popup SweetAlert yang LEBIH INFORMATIF
      const result = await Swal.fire({
        title: "Anda Akan Diarahkan ke YouTube Studio",
        icon: "info",
        // <<< PERUBAHAN UTAMA DI SINI >>>
        // Beri tahu pengguna akun mana yang harus mereka gunakan
        html: `
        <div style="text-align: left; padding: 0 1em;">
          <p>Untuk memoderasi komentar, Anda akan membuka tab baru.</p>
          <br>
          <p>Pastikan Anda sudah login di browser Anda dengan akun Google yang terhubung:</p>
          <p style="background-color: #f0f0f0; border-radius: 5px; padding: 10px; margin-top: 10px; font-weight: bold;">
            ${currentUser?.email || "Akun Google Anda"}
          </p>
        </div>
      `,
        showCancelButton: true,
        confirmButtonColor: "#007BFF", // Warna biru untuk aksi utama
        cancelButtonColor: "#6e7881",
        confirmButtonText: "Ya, Buka YouTube Studio",
        cancelButtonText: "Batal",
      });

      // 3. Jika pengguna setuju, buka link di tab baru (tidak berubah)
      if (result.isConfirmed) {
        window.open(studioUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      // Penanganan error Anda yang sudah ada
      handleApiError(err, "mengambil link moderasi");
    } finally {
      setIsLoading(false);
    }
  }, [analysisId, currentUser, checkPrerequisites, handleApiError]);

  return {
    videoUrl,
    setVideoUrl,
    isLoading,
    isAnalyzing,
    isDeleting,
    analysisId,
    videoAnalysisData,
    analyzedComments,
    pieChartData,
    stats,
    pollingMessage,
    currentUser, // Diekspor agar View bisa menggunakannya jika perlu (misal, tampilkan nama user)
    isYouTubeConnected, // Diekspor untuk View menampilkan status koneksi
    authError, // Diekspor untuk View menampilkan error autentikasi user
    isUserLoading, // Diekspor untuk View menampilkan loading data user
    handleSubmitAnalysis,
    handleManageComments,
    // handleBatchDeleteJudiComments,
    handleDeleteSingleComment,
  };
};
