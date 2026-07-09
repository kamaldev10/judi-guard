import { create } from 'zustand';
import {
  getHistoryApi,
  downloadReportApi,
  getReportPreviewApi,
  downloadPeriodReportApi,
} from '@/lib/services/historyApi';
import { toast } from 'sonner';

export const useHistoryStore = create((set, get) => ({
  history: [],
  pagination: null,

  isLoading: false,
  isDownloading: null,
  error: null,

  reportPreview: null, // Data JSON untuk Modal Preview
  isLoadingPreview: false,

  // Flag untuk memastikan data sudah pernah dimuat (opsional)
  isLoaded: false,

  fetchHistory: async (page = 1) => {
    // Guard: Jika sedang loading, jangan panggil lagi (Mencegah double fetch)
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const data = await getHistoryApi(page);

      // Validasi response backend
      if (data && Array.isArray(data.history)) {
        set({
          history: data.history,
          pagination: data.pagination,
        });
      } else {
        // Fallback jika data kosong/format salah
        set({ history: [], pagination: null });
      }
    } catch (err) {
      console.error('[HistoryStore] Error:', err);
      set({ error: 'Gagal memuat riwayat.' });
    } finally {
      set({ isLoading: false });
    }
  },

  handleDownload: async (analysisId, videoTitle) => {
    set({ isDownloading: analysisId });
    try {
      const blob = await downloadReportApi(analysisId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;

      const safeTitle = (videoTitle || 'video').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `Laporan_JudiGuard_${safeTitle}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Laporan PDF berhasil diunduh');
    } catch (err) {
      toast.error('Gagal mengunduh laporan PDF');
    } finally {
      set({ isDownloading: null });
    }
  },

  // Action: Generate Preview (JSON)
  generatePreview: async (dateRange) => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Pilih rentang tanggal terlebih dahulu');
      return;
    }

    set({ isLoadingPreview: true, error: null });
    try {
      const data = await getReportPreviewApi(dateRange.from, dateRange.to);
      set({ reportPreview: data });
    } catch (err) {
      toast.error('Gagal memuat preview laporan');
      console.error(err);
    } finally {
      set({ isLoadingPreview: false });
    }
  },

  // Action: Download PDF Periode
  downloadPeriodPDF: async (dateRange) => {
    try {
      toast.loading('Memproses PDF...');
      const blob = await downloadPeriodReportApi(dateRange.from, dateRange.to);

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_JudiGuard_Periode.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.dismiss();
      toast.success('Laporan berhasil diunduh');
    } catch (err) {
      toast.dismiss();
      toast.error('Gagal download PDF');
    }
  },

  // Reset Preview saat modal tutup
  resetPreview: () => set({ reportPreview: null }),
}));
