import React, { useEffect } from 'react';
import { useAnalysisUiStore } from '../stores/analysis-ui.store.js';
import { useAnalysisStatusQuery } from '../hooks/useAnalysisQueries.js';
import {
  Loader2,
  Search,
  Database,
  BrainCircuit,
  XCircle,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function AnalysisScanning() {
  const selectedVideo = useAnalysisUiStore((state) => state.selectedVideo);
  const activeAnalysisId = useAnalysisUiStore((state) => state.activeAnalysisId);
  const analysisStatus = useAnalysisUiStore((state) => state.analysisStatus);
  const analysisStats = useAnalysisUiStore((state) => state.analysisStats);

  const setStep = useAnalysisUiStore((state) => state.setStep);
  const setAnalysisStatus = useAnalysisUiStore((state) => state.setAnalysisStatus);
  const setAnalysisStats = useAnalysisUiStore((state) => state.setAnalysisStats);
  const resetToSelection = useAnalysisUiStore((state) => state.resetToSelection);

  const { data: statusData, error: queryError } = useAnalysisStatusQuery(activeAnalysisId);

  useEffect(() => {
    if (statusData) {
      setAnalysisStatus(statusData.status);
      setAnalysisStats(statusData);
      if (statusData.status === 'COMPLETED') {
        setStep('RESULTS');
      }
    }
  }, [statusData, setAnalysisStatus, setAnalysisStats, setStep]);

  const handleCancel = () => {
    setStep('PREVIEW');
    setAnalysisStatus(null);
    setAnalysisStats(null);
  };

  const isFailed = analysisStatus === 'FAILED' || !!queryError;
  const errorMsg =
    queryError?.message ||
    statusData?.errorMessage ||
    'Terjadi kesalahan sistem yang tidak diketahui.';

  if (isFailed) {
    return (
      <div className="flex min-h-[500px] w-full flex-col items-center justify-center space-y-6 py-12 animate-in zoom-in-95 duration-300">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <XCircle className="h-16 w-16 text-red-600 dark:text-red-500" />
          <div className="absolute -bottom-2 bg-white px-3 py-1 rounded-full shadow-sm border border-red-100 text-xs font-bold text-red-600 dark:bg-gray-800 dark:border-gray-700">
            ERROR
          </div>
        </div>

        <div className="text-center max-w-md space-y-2 px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analisis Gagal</h2>
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
            <div className="flex items-start gap-2 text-left">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          </div>
          <p className="text-gray-500 text-sm pt-2">
            Silakan coba lagi atau pilih video yang berbeda.
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <ArrowLeft size={18} />
            Kembali ke Preview
          </Button>
        </div>
      </div>
    );
  }

  const getStatusText = () => {
    if (!analysisStats) return 'Memulai sistem...';
    if (analysisStats.totalCommentsFetched === 0) return 'Menghubungkan ke YouTube API...';
    if (analysisStats.totalCommentsAnalyzed === 0) return `Sistem sedang mengambil komentar`;
    return 'Menganalisis dengan AI & Config...';
  };

  return (
    <div className="flex min-h-[600px] w-full flex-col items-center justify-center space-y-8 py-12 animate-in fade-in duration-700">
      <div className="relative flex h-64 w-64 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-10 duration-2000" />
        <div className="absolute inset-8 animate-ping rounded-full bg-blue-500 opacity-10 duration-2000 delay-500" />

        <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
          <Search className="h-10 w-10 text-blue-600 animate-pulse" />
        </div>

        <div className="absolute animate-spin-slow w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-white p-2 rounded-full shadow-sm border dark:bg-gray-800">
            <Database size={16} className="text-purple-500" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 bg-white p-2 rounded-full shadow-sm border dark:bg-gray-800">
            <BrainCircuit size={16} className="text-green-500" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sedang Memindai Video
          </h2>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="animate-spin" size={18} />
              <span className="font-medium text-lg">{getStatusText()}</span>
            </div>

            {analysisStats && (
              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-800">
                  Fetched: {analysisStats.totalCommentsFetched}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded dark:bg-gray-800">
                  Analyzed: {analysisStats.totalCommentsAnalyzed}
                </span>
              </div>
            )}
          </div>

          {selectedVideo && (
            <div className="mt-8 flex items-center gap-4 rounded-xl border bg-white p-3 shadow-sm max-w-md w-full dark:bg-gray-950 dark:border-gray-800">
              <img
                src={selectedVideo.thumbnail}
                className="h-12 w-20 rounded-lg object-cover bg-gray-200"
                alt="Thumbnail"
              />
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {selectedVideo.title}
                </h3>
                <p className="text-xs text-gray-500">ID: {selectedVideo.id}</p>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Batalkan Proses
        </Button>
      </div>
    </div>
  );
}
