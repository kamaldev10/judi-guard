/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useCallback, useState } from 'react';
import Swal from 'sweetalert2';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useVideoAnalysisStore } from '@/stores/videoAnalysisStore';
import { useAuthStore } from '@/stores/authStore';
import { validateYoutubeUrl } from '@/lib/utils/formValidators';
import { useUserStore } from '@/stores/userStore';

const POLLING_INTERVAL = 5000; // 5 detik

export const useVideoAnalysis = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isLoadingAnalysis,
    currentAnalysis,
    analyzedComments,
    submitVideoForAnalysis,
    fetchVideoAnalysis,
    fetchAnalyzedComments,
    deleteSingleComment,
    // batchDeleteJudiComments, // (Jika  mengaktifkannya di store)
    resetAnalysis,
  } = useVideoAnalysisStore();

  const { currentUser, authError } = useAuthStore();
  const { isLoadingUser, refreshUser } = useUserStore();

  const isYouTubeConnected = !!currentUser?.youtubeChannelId;
  const [videoUrl, setVideoUrl] = useState('');
  const [pollingMessage, setPollingMessage] = useState('');

  // // Efek untuk mengambil data pengguna saat hook pertama kali dimuat dau useUserStore
  // useEffect(() => {
  //   if (!currentUser) {
  //     refreshUser();
  //   }
  // }, []);

  // Efek untuk mengupdate PieChart dan Statistik ketika `analyzedComments` berubah
  const { pieChartData, stats } = useMemo(() => {
    if (analyzedComments.length > 0) {
      const judiCount = analyzedComments.filter((c) => c.classification === 'JUDI').length;
      const nonJudiCount = analyzedComments.filter((c) => c.classification === 'NON_JUDI').length;
      const totalCount = analyzedComments.length;

      const newPieData = [
        { name: 'Clean', value: nonJudiCount },
        { name: 'Spam', value: judiCount },
      ].filter((item) => item.value > 0);

      const newStats = {
        total: totalCount,
        JUDI: judiCount,
        NON_JUDI: nonJudiCount,
      };
      return { pieChartData: newPieData, stats: newStats };
    }
    return { pieChartData: [], stats: { total: 0, JUDI: 0, NON_JUDI: 0 } };
  }, [analyzedComments]);

  useEffect(() => {
    let intervalId = null;

    const analysisStatus = currentAnalysis?.status;
    const analysisId = currentAnalysis?._id;

    if (analysisId && ['PROCESSING', 'PENDING'].includes(analysisStatus) && isYouTubeConnected) {
      setPollingMessage(
        `Status: ${analysisStatus}. Komentar terproses: ${
          currentAnalysis.totalCommentsAnalyzed || 0
        }/${currentAnalysis.totalCommentsFetched || 0}`,
      );

      intervalId = setInterval(async () => {
        try {
          // Panggil action store untuk fetch update
          const updatedAnalysisData = await fetchVideoAnalysis(analysisId);

          // Cek jika proses selesai
          if (
            ['COMPLETED', 'FAILED'].includes(updatedAnalysisData.status) ||
            updatedAnalysisData.status?.includes('ERROR')
          ) {
            // Hentikan polling (dengan mengubah state yang dibaca useEffect ini)
            // (Store sudah otomatis update 'currentAnalysis', jadi loop akan berhenti di render berikutnya)
            setPollingMessage(
              updatedAnalysisData.status === 'COMPLETED'
                ? 'Analisis selesai.'
                : `Proses selesai dengan status: ${updatedAnalysisData.status}`,
            );

            if (updatedAnalysisData.status === 'COMPLETED') {
              // Ambil komentar
              const fetchedComments = await fetchAnalyzedComments(analysisId);

              // Tampilkan Toast Sukses (Notifikasi)
              toast.success(`Analisis selesai. Ditemukan ${fetchedComments.length} komentar.`, {
                position: 'bottom-right',
                autoClose: 3000,
                toastId: 'polling-complete-success',
              });
            } else {
              // Handle status FAILED dari backend (bukan error network/auth)
              toast.error(
                `Analisis gagal: ${updatedAnalysisData.errorMessage || 'Unknown error'}`,
                {
                  position: 'bottom-right',
                },
              );
            }
          }
        } catch (error) {
          console.error('Polling error:', error);

          const errorMessage = error.message || '';
          const errorStatus = error.response?.status;

          // 🔥 PERBAIKAN: Handle Token Expired / Invalid Grant saat Polling
          if (
            errorStatus === 401 ||
            errorMessage.includes('akses telah dicabut') ||
            errorMessage.includes('Gagal memperbarui sesi') ||
            errorMessage.includes('invalid_grant')
          ) {
            // 1. Hentikan Interval segera
            clearInterval(intervalId);

            // 2. Reset state polling agar UI tidak stuck
            setPollingMessage('');

            // 3. Tampilkan Popup Konfirmasi (karena butuh aksi user)
            Swal.fire({
              title: 'Koneksi YouTube Kadaluwarsa',
              text: 'Sesi YouTube Anda berakhir saat proses analisis. Silakan hubungkan ulang akun Anda untuk melanjutkan.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Hubungkan Ulang',
              cancelButtonText: 'Tutup',
            }).then((result) => {
              if (result.isConfirmed) {
                navigate('/profile'); // Arahkan ke halaman profil
              }
            });

            return; // Keluar dari fungsi interval
          }

          // Error polling biasa (misal koneksi putus sebentar) -> Tampilkan di teks status saja
          setPollingMessage(
            `Error saat polling: ${errorMessage}. Mencoba menghubungkan kembali...`,
          );
        }
      }, POLLING_INTERVAL);
    } else {
      setPollingMessage('');
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [
    currentAnalysis,
    isYouTubeConnected,
    fetchVideoAnalysis,
    fetchAnalyzedComments,
    navigate, // Pastikan navigate masuk dependency
  ]);

  //  Efek untuk menangani callback OAuth (TETAP SAMA, tapi panggil refreshUser dari authStore)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const linked = queryParams.get('youtube_linked');

    if (linked) {
      const errorMsgParam = queryParams.get('error');
      const successMsgParam = queryParams.get('message');

      // Panggil refreshUser dari authStore
      refreshUser().then(() => {
        if (linked === 'true') {
          toast.success(successMsgParam || 'Akun YouTube berhasil terhubung!');
        } else if (linked === 'false') {
          const decodedErrorMsg = errorMsgParam
            ? decodeURIComponent(errorMsgParam)
            : 'Gagal menghubungkan akun YouTube.';
          toast.error(decodedErrorMsg);
        }
      });
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate, refreshUser]);

  // 7. Handler Prasyarat
  const checkPrerequisites = useCallback(
    (actionNameForMessage) => {
      if (isLoadingUser) {
        Swal.fire({
          title: 'Mohon Tunggu',
          text: 'Sedang memverifikasi status pengguna...',
          icon: 'info',
          allowOutsideClick: false,
          showConfirmButton: false,
          timer: 2500,
        });
        return false;
      }
      if (authError) {
        Swal.fire(
          'Gagal Memuat Data Pengguna',
          `Tidak dapat melanjutkan ${actionNameForMessage}. ${authError} Silakan login menggunakan akun google/youtube anda.`,
          'error',
        );
        return false;
      }
      if (!isYouTubeConnected) {
        Swal.fire(
          'Koneksi YouTube Diperlukan',
          `Untuk ${actionNameForMessage}, silakan hubungkan akun YouTube Anda di halaman profil.`,
          'warning',
        );
        // Contoh: navigate('/profil/pengaturan'); // Anda mungkin ingin fungsi navigate di sini
        return false;
      }
      return true;
    },
    [isLoadingUser, authError, isYouTubeConnected],
  ); // Dependensi untuk useCallback

  /**
   * Helper function terpusat untuk menangani error API dan menampilkan notifikasi Swal.
   * @param {Error} error - Objek error yang ditangkap dari panggilan API.
   * @param {string} actionName - Nama aksi yang sedang dilakukan (misal, "Analisis Video").
   */
  const handleApiError = (error, actionName = 'Analisis Video') => {
    // Axios biasanya membungkus error HTTP dalam `error.response`
    if (error.response && error.response.status === 429) {
      // Kasus Spesifik: Kuota Habis (HTTP 429 Too Many Requests)
      Swal.fire({
        icon: 'error',
        title: 'Kuota API Youtube Habis',
        // Gunakan pesan dari backend jika ada, atau fallback
        text:
          error.response.data?.message ||
          'Jatah penggunaan YouTube API untuk hari ini telah habis. Fitur akan tersedia kembali besok.',
        confirmButtonText: 'Mengerti',
      });
    } else if (
      error.message.toLowerCase().includes('izin tidak cukup') ||
      error.message.toLowerCase().includes('otorisasi youtube')
    ) {
      // Kasus Spesifik: Masalah Izin/Otorisasi YouTube
      Swal.fire({
        icon: 'warning',
        title: 'Otorisasi YouTube Diperlukan',
        text: `Gagal melakukan ${actionName}. Pastikan akun YouTube Anda terhubung dengan benar dan memiliki izin yang diperlukan. Anda mungkin perlu menghubungkan ulang akun di halaman profil.`,
        confirmButtonText: 'OK',
      });
    } else {
      // Kasus Error Umum Lainnya
      Swal.fire({
        icon: 'error',
        title: `Oops! Terjadi Kesalahan`,
        text: error.message || `Gagal melakukan ${actionName}. Silakan coba lagi.`,
        confirmButtonText: 'Tutup',
      });
    }
  };

  // Handler Submit (Disederhanakan)
  //    Sekarang memanggil action `submitVideoForAnalysis` dari store
  const handleSubmitAnalysis = useCallback(async () => {
    if (!checkPrerequisites('memulai analisis')) return;
    const validationError = validateYoutubeUrl(videoUrl);
    if (validationError) {
      Swal.fire('Input Tidak Valid', validationError, 'warning');
      return;
    }

    // Reset state lokal dan store
    resetAnalysis();
    setPollingMessage('Mengirim permintaan analisis...');

    const loadingToastId = toast.loading('Video Anda sedang dikirim untuk dianalisis...', {
      position: 'bottom-right',
    });

    // Swal.fire({
    //   title: "Memulai Analisis...",
    //   text: "Video Anda sedang dikirim untuk dianalisis.",
    //   icon: "info",
    //   allowOutsideClick: false,
    //   didOpen: () => Swal.showLoading(),
    // });

    try {
      // Panggil action store
      const initialAnalysisData = await submitVideoForAnalysis(videoUrl);

      // Logika setelah submit (tetap sama, karena polling akan mengambil alih)
      if (initialAnalysisData.status === 'COMPLETED') {
        toast.update(loadingToastId, {
          render: 'Analisis selesai. Mengambil komentar...',
          type: 'info',
          isLoading: false,
          autoClose: 1500,
        });

        // Swal.update({ text: `Analisis selesai. Mengambil komentar...` });

        const fetchedComments = await fetchAnalyzedComments(initialAnalysisData._id);

        toast.success(`Analisis selesai. Ditemukan ${fetchedComments.length} komentar.`, {
          position: 'bottom-right',
          autoClose: 2000,
        });
        // Swal.close();
        // Swal.fire(
        //   "Analisis Selesai!",
        //   `Ditemukan ${fetchedComments.length} komentar.`,
        //   "success"
        // );
        // } else if (
        //   ["PENDING", "PROCESSING"].includes(initialAnalysisData.status)
        // ) {
        //   Swal.update({
        //     text: `Analisis sedang berjalan (Status: ${initialAnalysisData.status}).`,
        //   });
        //   setPollingMessage(`Status: ${initialAnalysisData.status}. Menunggu...`);
      } else {
        // Swal.close();
        toast.update(loadingToastId, {
          render: initialAnalysisData.errorMessage || 'Analisis gagal dimulai.',
          type: 'error',
          isLoading: false,
          autoClose: 2000,
        });

        throw new Error(initialAnalysisData.errorMessage || 'Analisis gagal dimulai.');
      }
    } catch (err) {
      toast.dismiss(loadingToastId);

      // Swal.close();
      handleApiError(err, 'Analisis Video');
    }
  }, [
    videoUrl,
    checkPrerequisites,
    fetchAnalyzedComments,
    submitVideoForAnalysis,
    resetAnalysis,
    handleApiError,
  ]);

  // 10. Handler Delete Single (Disederhanakan)
  //     ✅ INI ADALAH PERBAIKAN YANG ANDA MINTA
  const handleDeleteSingleComment = useCallback(
    async (analyzedCommentId, commentText) => {
      if (!checkPrerequisites('menghapus komentar ini')) return;

      const commentToDelete = analyzedComments.find((c) => c._id === analyzedCommentId);
      if (!commentToDelete) {
        Swal.fire('Error', 'Komentar tidak ditemukan.', 'error');
        return;
      }

      const analysisId = currentAnalysis?._id;

      // Konfirmasi (tetap di hook)
      const confirmResult = await Swal.fire({
        title: 'Konfirmasi Penghapusan',
        html: `Yakin hapus komentar: <i>"${commentText.substring(0, 100)}..."</i>?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonText: 'Batal',
        confirmButtonText: 'Ya, Hapus',
      });

      if (!confirmResult.isConfirmed) return;

      // TIDAK perlu optimistic update atau setIsDeleting
      // Cukup panggil action store
      try {
        // Panggil action store, yang MENGGUNAKAN (commentId, analysisId)
        await deleteSingleComment(analyzedCommentId, analysisId);

        // Store akan me-refresh `analyzedComments`, UI akan update
        Swal.fire(
          'Berhasil!',
          `Komentar "${commentToDelete.youtubeCommentId || 'pilihan'}" berhasil dihapus.`,
          'success',
        );
      } catch (error) {
        let errorMessage = 'Gagal menghapus komentar';
        let errorDetails = '';

        if (error.response?.data?.error) {
          // Handle API structured errors
          errorMessage = error.response.data.error.message;
          errorDetails = error.response.data.error.details;
        } else if (error.message.includes('Kuota')) {
          errorMessage = 'Kuota API YouTube habis, coba lagi nanti';
        } else if (error.message.includes('tidak valid')) {
          errorMessage = 'Format komentar tidak valid';
        } else if (error.message.includes('NOT_COMMENT_OWNER')) {
          errorMessage = 'Anda bukan pemilik komentar ini';
        } else if (error.message.includes('COMMENT_NOT_FOUND')) {
          errorMessage = 'Komentar sudah dihapus atau tidak ditemukan';
        }

        await Swal.fire({
          title: 'Error',
          html: `${errorMessage}${errorDetails ? `<br><small>${errorDetails}</small>` : ''}`,
          icon: 'error',
        });
      }
    },
    [analyzedComments, checkPrerequisites, deleteSingleComment],
  );

  //  Handler Manage Comments (Disederhanakan)
  //     Kita perlu `fetchStudioLink` dari store
  const { fetchStudioLink } = useVideoAnalysisStore();
  const handleManageComments = useCallback(async () => {
    if (!checkPrerequisites('mengelola komentar')) return;
    if (!currentAnalysis?._id) return;

    // Set loading (bisa gunakan state lokal, atau isLoadingAnalysis dari store)
    // Mari kita gunakan isLoadingAnalysis dari store
    useVideoAnalysisStore.setState({ isLoadingAnalysis: true });

    try {
      const studioUrl = await fetchStudioLink(currentAnalysis._id);

      const result = await Swal.fire({
        title: 'Anda Akan Diarahkan ke YouTube Studio',
        icon: 'info',
        html: `
        <div style="text-align: left; padding: 0 1em;">
          <p>Untuk memoderasi komentar, Anda akan membuka tab baru.</p>
          <br>
          <p>Pastikan Anda sudah login di browser Anda dengan akun Google yang terhubung:</p>
          <p style="background-color: #f0f0f0; border-radius: 5px; padding: 10px; margin-top: 10px; font-weight: bold;">
            ${currentUser?.email || 'Akun Google Anda'}
          </p>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: 'Ya, Buka YouTube Studio',
        cancelButtonText: 'Batal',
      });

      if (result.isConfirmed) {
        window.open(studioUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      handleApiError(err, 'mengambil link moderasi');
    } finally {
      useVideoAnalysisStore.setState({ isLoadingAnalysis: false });
    }
  }, [currentAnalysis, currentUser, checkPrerequisites, fetchStudioLink, handleApiError]);

  return {
    videoUrl,
    setVideoUrl,
    isLoading: isLoadingAnalysis || isLoadingUser,
    isAnalyzing: ['PROCESSING', 'PENDING'].includes(currentAnalysis?.status), // Berdasarkan status
    isDeleting: isLoadingAnalysis, // Gunakan isLoading utama untuk ini
    analysisId: currentAnalysis?._id,
    videoAnalysisData: currentAnalysis,
    analyzedComments,
    pieChartData,
    stats,
    pollingMessage,
    currentUser,
    isYouTubeConnected,
    authError,

    handleSubmitAnalysis,
    handleManageComments,
    handleDeleteSingleComment,
  };
};
