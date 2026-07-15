import React, { useState } from 'react';
import {
  useBlacklistQuery,
  useAddBlacklistMutation,
  useDeleteBlacklistMutation,
} from '../hooks/useConfigQueries.js';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

export default function BlacklistManager() {
  const { data: blacklist = [], isLoading: isLoadingBlacklist } = useBlacklistQuery();
  const addMutation = useAddBlacklistMutation();
  const deleteMutation = useDeleteBlacklistMutation();

  const [input, setInput] = useState('');

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!input.trim()) return;

      try {
        const report = await addMutation.mutateAsync({ keyword: input });

        if (report.added && report.added.length > 0) {
          toast.success(`Ditambahkan: ${report.added.join(', ')}`);
          setInput('');
        } else if (report.skipped_duplicate?.length > 0) {
          toast.info('Kata kunci sudah ada di daftar.');
          setInput('');
        } else if (report.skipped_default?.length > 0) {
          toast.info('Kata kunci ini sudah menjadi default sistem.');
          setInput('');
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Kata kunci dihapus');
    } catch (error) {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="h-full flex flex-col rounded-xl border bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800 animate-in fade-in duration-500">
      <div className="border-b p-6 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/20">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Blacklist Kata Kunci
            </h3>
            <p className="text-sm text-gray-500">
              Komentar dengan kata ini otomatis ditandai spam.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="relative mb-6">
          <input
            type="text"
            name="keyword"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={addMutation.isPending}
            placeholder="Ketik kata lalu Enter..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-red-500 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          />
          <div className="absolute right-2 top-2.5">
            <kbd className="hidden sm:inline-block rounded border bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              Enter
            </kbd>
          </div>
        </div>

        <div className="min-h-[100px] rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 dark:bg-gray-900/50 dark:border-gray-800">
          {isLoadingBlacklist ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-16 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          ) : blacklist.length === 0 ? (
            <p className="text-center text-sm text-gray-400 mt-6">Belum ada blacklist.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {blacklist.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-2 rounded-full bg-white border px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-all hover:border-red-200 hover:text-red-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                  <span>{item.keyword}</span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deleteMutation.isPending}
                    className="ml-1 rounded-full p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
