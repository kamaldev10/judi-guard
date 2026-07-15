import { useState } from 'react';
import {
  FileText,
  Calendar,
  Youtube,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import ReportDialog from '../components/ReportDialog.jsx';
import { useHistoryQuery } from '../hooks/useHistoryQueries.js';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useHistoryQuery(page);
  const history = data?.history ?? [];
  const pagination = data?.pagination ?? null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Analisis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar video yang pernah Anda analisis beserta laporan moderasi.
        </p>
      </div>

      <div>
        <ReportDialog />
      </div>

      <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800 flex flex-col min-h-[500px]">
        <div className="border-b p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            <Clock size={16} />
            <span>Total Riwayat: {pagination?.total || 0} Video</span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 border-b dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 font-medium">Waktu Request</th>
                <th className="px-6 py-3 font-medium w-[40%]">Video Info</th>
                <th className="px-6 py-3 font-medium text-center">Spam / Total</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Memuat riwayat...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <FileText size={40} />
                      <p>Belum ada riwayat analisis.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Calendar size={14} />
                        <span>{formatDate(item.requestedAt)}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/20">
                          <Youtube size={20} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="font-medium text-gray-900 dark:text-white line-clamp-1"
                            title={item.videoTitle}
                          >
                            {item.videoTitle}
                          </p>
                          <a
                            href={`https://youtu.be/${item.youtubeVideoId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            ID: {item.youtubeVideoId}
                          </a>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.totalSpamDetected}{' '}
                          <span className="text-gray-400 font-normal">
                            / {item.totalCommentsAnalyzed}
                          </span>
                        </span>
                        <span className="text-[10px] text-red-500 font-medium">SPAM</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={item.moderationStatus} processStatus={item.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t p-4 dark:border-gray-800 bg-gray-50/50 rounded-b-xl">
            <span className="text-xs text-gray-500">
              Hal {pagination.page} dari {pagination.pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                <ChevronLeft size={14} /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPage(pagination.page + 1)}
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, processStatus }) {
  if (processStatus === 'PROCESSING') {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 animate-pulse">
        Memproses
      </span>
    );
  }
  if (processStatus === 'FAILED') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        Gagal
      </span>
    );
  }

  switch (status) {
    case 'CLEANED':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200">
          <ShieldCheck size={10} /> Bersih
        </span>
      );
    case 'PARTIAL':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 border border-yellow-200">
          <AlertTriangle size={10} /> Sebagian
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 border border-gray-200">
          Belum Aksi
        </span>
      );
  }
}
