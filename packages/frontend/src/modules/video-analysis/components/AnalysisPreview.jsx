import React from 'react';
import { useAnalysisUiStore } from '../stores/analysis-ui.store.js';
import { useVideoCommentsQuery, useStartAnalysisMutation } from '../hooks/useAnalysisQueries.js';
import { ArrowLeft, Play, MessageSquare, ThumbsUp, Eye, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

export default function AnalysisPreview() {
  const selectedVideo = useAnalysisUiStore((state) => state.selectedVideo);
  const resetToSelection = useAnalysisUiStore((state) => state.resetToSelection);
  const setStep = useAnalysisUiStore((state) => state.setStep);
  const setActiveAnalysisId = useAnalysisUiStore((state) => state.setActiveAnalysisId);
  const setAnalysisStatus = useAnalysisUiStore((state) => state.setAnalysisStatus);

  const { data: commentsData, isLoading: isLoadingPreview } = useVideoCommentsQuery(
    selectedVideo?.id,
  );
  const startAnalysisMutation = useStartAnalysisMutation();

  if (!selectedVideo) return null;

  const previewComments = commentsData?.comments || [];

  const fmt = (num) => parseInt(num || 0).toLocaleString('id-ID');

  const handleStartAnalysis = async () => {
    try {
      setStep('SCANNING');
      setAnalysisStatus('PROCESSING');
      const ticket = await startAnalysisMutation.mutateAsync(selectedVideo.id);
      setActiveAnalysisId(ticket.analysisId);
    } catch (err) {
      toast.error(err.message || 'Gagal memulai analisis.');
      setStep('PREVIEW');
      setAnalysisStatus(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl animate-in slide-in-from-right-4 duration-500">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={resetToSelection}
          className="gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={18} /> Pilih Video Lain
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800">
            <div className="relative aspect-video w-full bg-gray-100">
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="line-clamp-2 font-bold text-white text-lg leading-tight shadow-black drop-shadow-md">
                  {selectedVideo.title}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-6">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Eye size={18} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(selectedVideo.statistics?.viewCount)}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">Views</span>
                </div>
                <div className="flex flex-col items-center gap-1 border-x border-gray-100 dark:border-gray-800">
                  <ThumbsUp size={18} className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(selectedVideo.statistics?.likeCount)}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">Likes</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <MessageSquare size={18} className="text-purple-500" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(selectedVideo.statistics?.commentCount)}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">Comments</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleStartAnalysis}
                  disabled={startAnalysisMutation.isPending}
                  className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl transition-all hover:scale-[1.02]"
                >
                  <Play className="mr-2 fill-white" size={20} />
                  {startAnalysisMutation.isPending ? 'Memulai...' : 'Mulai Analisis AI'}
                </Button>
                <p className="text-center text-xs text-gray-400">
                  Sistem akan memindai komentar dan mendeteksi spam secara otomatis.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            <div className="flex gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <p>
                Pastikan video ini memiliki komentar publik. Komentar yang ditahan untuk tinjauan
                tidak dapat diakses via API.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800 flex flex-col min-h-[600px]">
            <div className="border-b p-4 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 rounded-t-2xl">
              <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <MessageSquare size={18} className="text-gray-500" />
                Preview Komentar Terbaru
              </h3>
              <span className="text-xs bg-white border px-2.5 py-1 rounded-full text-gray-600 font-medium shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                {isLoadingPreview ? 'Memuat...' : `${previewComments.length} Ditampilkan`}
              </span>
            </div>

            <div className="flex-1 p-0">
              {isLoadingPreview ? (
                <div className="p-6 space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-800" />
                          <div className="h-3 w-20 bg-gray-100 rounded dark:bg-gray-800" />
                        </div>
                        <div className="h-16 w-full bg-gray-50 rounded dark:bg-gray-900" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : previewComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p>Tidak ada komentar ditemukan atau belum dimuat.</p>
                </div>
              ) : (
                <ul data-cy="comment-list-section" className="divide-y dark:divide-gray-800">
                  {previewComments.map((thread, idx) => {
                    const comment = thread.topLevelComment;
                    if (!comment || !comment.author) return null;

                    return (
                      <li
                        data-cy="comment-item"
                        key={comment.id || idx}
                        className="p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      >
                        <div className="flex gap-4">
                          <img
                            src={comment.author.avatar || 'https://ui-avatars.com/api/?name=User'}
                            alt={comment.author.name || 'User'}
                            className="h-10 w-10 rounded-full border border-gray-100 bg-white object-cover shadow-sm"
                            loading="lazy"
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {comment.author.name || 'User'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                                <Calendar size={12} />
                                <span>{new Date(comment.publishedAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300 wrap-break-word">
                              {comment.text}
                            </p>

                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 font-medium">
                              <div className="flex items-center gap-1">
                                <ThumbsUp size={12} />
                                <span>{comment.likeCount}</span>
                              </div>
                              {thread.replies && thread.replies.length > 0 && (
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                  <MessageSquare size={12} />
                                  <span>{thread.replies.length} Balasan</span>
                                </div>
                              )}
                            </div>

                            {thread.replies && thread.replies.length > 0 && (
                              <div className="mt-3 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-3">
                                {thread.replies.slice(0, 2).map((reply) => (
                                  <div key={reply.id} className="flex gap-2">
                                    <img
                                      src={reply.author.profileImageUrl}
                                      className="h-6 w-6 rounded-full"
                                      alt="avatar"
                                    />
                                    <div>
                                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mr-2">
                                        {reply.author.name}
                                      </span>
                                      <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {reply.text}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="bg-gray-50 p-3 text-center text-xs text-gray-500 border-t dark:bg-gray-900 dark:border-gray-800 rounded-b-2xl">
              Hanya menampilkan 50 komentar teratas sebagai preview. Analisis AI akan memindai
              seluruh komentar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
