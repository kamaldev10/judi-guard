import { useEffect, useState, useRef } from 'react';
import { useVideoAnalysisStore } from '@/stores/videoAnalysisStore';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Download,
  Search,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Undo2,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; // Pastikan komponen UI ini ada (Shadcn)
import { toast } from 'sonner';

export default function AnalysisResults() {
  const {
    comments,
    pagination,
    fetchResults,
    resetToSelection,
    isLoadingResults,
    setFilter,
    filters,
    analysisStats,
    executeCleanup,
    executeUndo,
    isExecuting,
  } = useVideoAnalysisStore();

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const searchTimeout = useRef(null); // Debounce search

  // State untuk Dialog Konfirmasi Hapus
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [banAuthor, setBanAuthor] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    // Ambil hasil pertama kali (Page 1, All Risk)
    fetchResults();
  }, []);

  // --- LOGIC SELECTION ---

  // Cek apakah item yang dipilih adalah item yang SUDAH dihapus?
  // Jika ya, kita tampilkan tombol Undo. Jika belum, tampilkan tombol Delete.
  const isSelectionDeleted =
    selectedIds.length > 0 &&
    comments.find((c) => c._id === selectedIds[0])?.actionTaken === 'DELETE';

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      const actionableIds = comments
        .filter(
          (c) =>
            // Pilih yang JUDI dan statusnya BUKAN Delete/Hold.
            // Jadi 'NONE' dan 'RESTORED' akan masuk.
            c.classification === 'JUDI' && c.actionTaken !== 'DELETE' && c.actionTaken !== 'HOLD',
        )
        .map((c) => c._id);
      setSelectedIds(actionableIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // --- HANDLERS ---

  const handleDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;

    // 1. Simpan ID ke variabel lokal (Closure) agar tidak hilang saat state reset
    const idsToDelete = [...selectedIds];
    const count = idsToDelete.length;

    // 2. Eksekusi Hapus
    // Pastikan executeCleanup mengembalikan true/data jika sukses
    const result = await executeCleanup(idsToDelete, banAuthor);

    // 3. Jika Sukses
    if (result) {
      // BERSIHKAN STATE SELECTION SEGERA
      setSelectedIds([]);
      setShowDeleteDialog(false);
      setBanAuthor(false);

      // 4. Tampilkan Toast dengan Logic Undo yang Lebih Kuat
      toast.success(`Berhasil menghapus ${count} komentar`, {
        duration: 8000,
        description: 'Salah hapus? Klik Undo untuk membatalkan.',
        action: {
          label: 'UNDO SEKARANG',
          onClick: () => {
            // Panggil fungsi undo
            const promise = executeUndo(idsToDelete);

            // Beri feedback visual saat proses Undo berjalan
            toast.promise(promise, {
              loading: 'Mengembalikan komentar...',
              success: 'Komentar berhasil dikembalikan!',
              error: 'Gagal melakukan undo',
            });
          },
        },
      });
    }
  };

  const handleUndo = async () => {
    if (selectedIds.length === 0) return;
    const success = await executeUndo(selectedIds);
    if (success) setSelectedIds([]);
  };

  //  Handle Search (Debounce 500ms)
  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      setFilter('search', val);
    }, 500);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={resetToSelection}
            className="-ml-3 gap-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft size={18} /> Analisis Baru
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hasil Analisis Video</h1>
        </div>
        {/* <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            className="gap-2"
          >
            <Download size={16} /> Unduh PDF
          </Button>
        </div> */}
      </div>

      {/* --- STATISTIK CARDS --- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Analyzed */}
        <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Komentar</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {analysisStats?.totalCommentsAnalyzed || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Spam Detected */}
        <div className="rounded-xl border bg-red-50 p-4 shadow-sm border-red-100 dark:bg-red-900/10 dark:border-red-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600/80">Potensi Spam</p>
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-500">
                {analysisStats?.totalSpamDetected || 0}
              </h3>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="rounded-xl border bg-green-50 p-4 shadow-sm border-green-100 dark:bg-green-900/10 dark:border-green-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600/80">Status Moderasi</p>
              <h3 className="text-xl font-bold text-green-700 dark:text-green-500">
                {analysisStats?.moderationStatus === 'CLEANED' ? 'BERSIH' : 'BUTUH TINDAKAN'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800 flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['', 'HIGH', 'MEDIUM', 'LOW'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter('riskLevel', level)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
                  filters.riskLevel === level
                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                }`}
              >
                {level === '' ? 'Semua' : `${level} Risk`}
              </button>
            ))}
          </div>

          {/* ACTION BUTTONS (DYNAMIC) */}
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-3 animate-in slide-in-from-right-5 fade-in">
                <span className="text-sm font-medium text-gray-600">
                  {selectedIds.length} dipilih
                </span>

                {isSelectionDeleted ? (
                  // TOMBOL UNDO (Jika item yang dipilih sudah dihapus)
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUndo}
                    disabled={isExecuting}
                    className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    {isExecuting ? (
                      'Mengembalikan...'
                    ) : (
                      <>
                        <Undo2 size={16} /> Kembalikan (Undo)
                      </>
                    )}
                  </Button>
                ) : (
                  // TOMBOL DELETE (Jika item belum dihapus)
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)} // Buka dialog dulu
                    disabled={isExecuting}
                    className="gap-2 shadow-sm"
                  >
                    <Trash2 size={16} /> Hapus Komentar
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari komentar..."
                  value={searchInput}
                  onChange={handleSearch}
                  className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-900 dark:border-gray-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 border-b dark:border-gray-800">
              <tr>
                <th className="w-12 px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 size-4"
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 font-medium">Author</th>
                <th className="px-6 py-3 font-medium w-[40%]">Komentar</th>
                <th className="px-6 py-3 font-medium">Analisis AI</th>
                <th className="px-6 py-3 font-medium text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {isLoadingResults ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="flex justify-center gap-2 items-center">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </td>
                </tr>
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Filter size={32} className="opacity-20" />
                      <p>Tidak ada komentar ditemukan dengan filter ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comments.map((item) => (
                  <tr
                    key={item._id}
                    className={`group transition-colors ${selectedIds.includes(item._id) ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 size-4"
                        checked={selectedIds.includes(item._id)}
                        onChange={() => toggleSelectOne(item._id)}
                        // Disable jika beda status dengan selection pertama (agar tidak campur aduk undo/delete)
                        disabled={
                          (selectedIds.length > 0 &&
                            isSelectionDeleted &&
                            item.actionTaken === 'NONE') ||
                          (selectedIds.length > 0 &&
                            !isSelectionDeleted &&
                            item.actionTaken === 'DELETE')
                        }
                      />
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <img
                          src={item.commentAuthorProfileImageUrl}
                          className="h-8 w-8 rounded-full bg-gray-100 border"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[150px]">
                            {item.commentAuthorDisplayName}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(item.commentPublishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed wrap-break-words line-clamp-3 group-hover:line-clamp-none transition-all">
                          {item.commentTextDisplay}
                        </p>
                        {/* Indikator Keyword Spam */}
                        {item.detectedKeywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.detectedKeywords.map((k, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        )}
                        <a
                          href={`https://youtube.com/watch?v=${item.youtubeVideoId}&lc=${item.youtubeCommentId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Buka di YouTube <ExternalLink size={10} />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <RiskBadge
                          data-cy="spam-label"
                          level={item.riskLevel}
                          score={item.confidenceScore}
                        />
                        {item.spamIndicators?.isWhitelisted && (
                          <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                            <ShieldCheck size={10} /> Whitelisted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                      {item.actionTaken === 'DELETE' ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                          Dihapus
                        </span>
                      ) : item.actionTaken === 'HOLD' ? (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          Ditahan
                        </span>
                      ) : item.classification === 'JUDI' ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 animate-pulse">
                          Perlu Review
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4 dark:border-gray-800 bg-gray-50/50 rounded-b-xl">
            <span className="text-xs text-gray-500">
              Menampilkan {comments.length} dari {pagination.totalItems} data
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pagination.currentPage === 1}
                onClick={() => fetchResults({ page: pagination.currentPage - 1 })}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-xs font-medium px-2">
                Hal {pagination.currentPage} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => fetchResults({ page: pagination.currentPage + 1 })}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus {selectedIds.length} Komentar?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan memindahkan komentar ke folder Spam/Rejected di YouTube.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Opsi Ban Author */}
            <div className="py-4">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-900/50">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={banAuthor}
                  onChange={(e) => setBanAuthor(e.target.checked)}
                />
                <div>
                  <span className="block font-medium text-gray-900 dark:text-white">
                    Blokir Penulis Juga (Ban Author)
                  </span>
                  <span className="text-xs text-gray-500">
                    User ini tidak akan bisa berkomentar lagi di channel Anda selamanya.{' '}
                  </span>
                </div>
              </label>

              {banAuthor && (
                <div className="rounded-md bg-orange-50 p-3 text-sm text-orange-800 border border-orange-200 animate-in slide-in-from-top-2 fade-in">
                  <div className="flex gap-2">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5 text-orange-600" />
                    <div className="space-y-1">
                      <p className="font-bold">Perhatian: Fitur Undo Terbatas!</p>
                      <p className="text-xs leading-relaxed">
                        Jika penulis diblokir, mengembalikan komentar (Undo){' '}
                        <strong>tidak akan membuat komentar muncul kembali</strong> di publik
                        kecuali Anda membuka blokir user tersebut secara manual di YouTube Studio.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowDeleteDialog(false);
                  setBanAuthor(false);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isExecuting ? 'Memproses...' : 'Ya, Hapus Sekarang'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function RiskBadge({ level, score, ...props }) {
  const config = {
    HIGH: { color: 'bg-red-100 text-red-700 border-red-200', label: 'TINGGI' },
    MEDIUM: {
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      label: 'SEDANG',
    },
    LOW: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      label: 'RENDAH',
    },
    NONE: {
      color: 'bg-green-100 text-green-700 border-green-200',
      label: 'AMAN',
    },
  };

  const style = config[level] || config.NONE;

  return (
    <div {...props} className="flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold ${style.color}`}
      >
        {style.label}
      </span>
      {score > 0 && (
        <span className="text-[10px] text-gray-400">AI: {(score * 100).toFixed(0)}%</span>
      )}
    </div>
  );
}
