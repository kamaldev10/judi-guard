import React, { useState } from 'react';
import { useAnalysisUiStore } from '../stores/analysis-ui.store.js';
import { useMyVideos, useSearchVideoMutation } from '../hooks/useAnalysisQueries.js';
import { Search, Loader2, PlayCircle, Eye, MessageSquare } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

export default function AnalysisSelection() {
  const setSelectedVideo = useAnalysisUiStore((state) => state.setSelectedVideo);
  const setStep = useAnalysisUiStore((state) => state.setStep);

  const { myVideos, isLoadingList, nextPageToken, fetchMyVideos } = useMyVideos();
  const searchVideoMutation = useSearchVideoMutation();

  const [inputUrl, setInputUrl] = useState('');

  const onSearch = async (e) => {
    e.preventDefault();
    if (!inputUrl) return;

    try {
      const videoData = await searchVideoMutation.mutateAsync(inputUrl);
      const formattedVideo = {
        id: videoData.id,
        title: videoData.title,
        thumbnail: videoData.thumbnail,
        statistics: videoData.statistics,
      };
      setSelectedVideo(formattedVideo);
      setStep('PREVIEW');
    } catch (err) {
      toast.error(err.message || 'Video tidak ditemukan.');
    }
  };

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setStep('PREVIEW');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Pilih Video untuk Dianalisis
          </h1>
          <p className="max-w-xl text-gray-500 dark:text-gray-400">
            Cari menggunakan link YouTube atau pilih langsung dari koleksi channel Anda di bawah.
          </p>
        </div>

        <form onSubmit={onSearch} className="relative w-full max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-gray-400" />
            <input
              data-cy="input-video-link"
              type="text"
              placeholder="Tempel link YouTube di sini (https://youtube.com/watch?v=...)"
              className="h-14 w-full rounded-2xl border-2 border-gray-100 bg-white pl-12 pr-32 text-base outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-blue-500"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
            />
            <div className="absolute right-2">
              <Button
                data-cy="btn-search"
                size="lg"
                disabled={searchVideoMutation.isPending || !inputUrl}
                className="h-10 rounded-xl px-6 font-semibold"
              >
                {searchVideoMutation.isPending ? <Loader2 className="animate-spin" /> : 'Cari'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800" />

      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Terbaru Channel Anda
          </h2>
        </div>

        {myVideos.length === 0 && !isLoadingList ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-gray-500">Tidak ada video ditemukan di channel ini.</p>
            <Button variant="link" onClick={() => fetchMyVideos()} className="mt-2">
              Coba Refresh
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myVideos.map((video) => (
              <div
                data-cy="video-grid-item"
                key={video.id}
                onClick={() => handleSelectVideo(video)}
                className="group cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg dark:bg-gray-950 dark:border-gray-800 dark:hover:border-blue-700"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                </div>

                <div className="p-4">
                  <h3
                    className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
                    title={video.title}
                  >
                    {video.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1" title="Views">
                      <Eye size={14} />
                      <span>{parseInt(video.statistics?.viewCount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Comments">
                      <MessageSquare size={14} />
                      <span>{parseInt(video.statistics?.commentCount || 0).toLocaleString()}</span>
                    </div>
                    <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {isLoadingList &&
              [1, 2, 3, 4].map((i) => (
                <div
                  key={`skel-${i}`}
                  className="rounded-xl border bg-white p-0 shadow-sm dark:bg-gray-950 dark:border-gray-800"
                >
                  <div className="aspect-video w-full animate-pulse bg-gray-200 dark:bg-gray-800" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  </div>
                </div>
              ))}
          </div>
        )}

        {nextPageToken && !isLoadingList && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => fetchMyVideos(nextPageToken)}
              className="min-w-[200px]"
            >
              Muat Lebih Banyak
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
