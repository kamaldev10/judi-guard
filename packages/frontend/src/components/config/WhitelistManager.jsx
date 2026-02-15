import { useEffect, useState } from "react";
import { useConfigStore } from "@/stores/configStore";
import { Button } from "@/components/ui/button"; // Pastikan path benar (huruf kecil 'button')
import {
  Trash2,
  ShieldCheck,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

export default function WhitelistManager() {
  const {
    whitelist,
    fetchWhitelist,
    addToWhitelist,
    removeFromWhitelist,
    isLoadingWhitelist,
    isSubmitting,
  } = useConfigStore();

  // State diganti object untuk menampung multiple fields
  const [formData, setFormData] = useState({
    channelId: "",
    channelName: "",
    note: "",
  });

  const [showOptions, setShowOptions] = useState(false); // Toggle opsi tambahan
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    fetchWhitelist();
  }, [fetchWhitelist]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.channelId.trim()) return;

    setLocalError(null);

    try {
      // Kirim object lengkap ke store
      await addToWhitelist({
        channelId: formData.channelId,
        channelName: formData.channelName,
        note: formData.note,
      });

      toast.success("Channel berhasil ditambahkan");

      // Reset Form
      setFormData({ channelId: "", channelName: "", note: "" });
      setShowOptions(false); // Tutup opsi setelah sukses
    } catch (error) {
      setLocalError(error.message);
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeFromWhitelist(id);
      toast.success("Channel dihapus");
    } catch (error) {
      toast.error("Gagal menghapus channel");
    }
  };

  return (
    <div className="h-full flex flex-col rounded-xl border bg-white shadow-sm dark:bg-gray-950 dark:border-gray-800 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="border-b p-6 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Whitelist Channel
            </h3>
            <p className="text-sm text-gray-500">
              Channel ini aman dari deteksi spam.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* FORM INPUT */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          {/* Input Utama (ID/Handle) */}
          <div className="flex gap-2">
            <input
              type="text"
              name="channelId"
              placeholder="Wajib: @gadgetin atau Channel ID..."
              value={formData.channelId}
              onChange={handleChange}
              className={`flex-1 rounded-lg border px-4 py-2 focus:outline-none dark:bg-gray-900 dark:text-white ${
                localError
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-green-500"
              }`}
            />
            <Button
              disabled={isSubmitting || !formData.channelId}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
            >
              {isSubmitting ? (
                "..."
              ) : (
                <>
                  <Plus size={18} className="mr-2" /> Tambah
                </>
              )}
            </Button>
          </div>

          {/* Toggle Opsi Tambahan */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {showOptions ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
              {showOptions
                ? "Sembunyikan Opsi"
                : "Isi Detail Opsional (Nama/Catatan)"}
            </button>
          </div>

          {/* Input Opsional (Collapse) */}
          {showOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in slide-in-from-top-2 pt-2">
              {/* Nama Channel */}
              <div className="relative">
                <User
                  size={14}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="channelName"
                  placeholder="Nama Channel (Opsional)"
                  value={formData.channelName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>

              {/* Catatan */}
              <div className="relative">
                <StickyNote
                  size={14}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  name="note"
                  placeholder="Catatan: Teman / Official (Opsional)"
                  value={formData.note}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:border-green-500 focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </form>

        {/* ERROR MESSAGE BOX */}
        {localError && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={16} />
            <p>{localError}</p>
          </div>
        )}

        {/* LIST WHITELIST */}
        <div className="flex-1 min-h-[100px] rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4 dark:bg-gray-900/50 dark:border-gray-800 overflow-y-auto max-h-[400px]">
          {isLoadingWhitelist ? (
            <div className="space-y-3 py-2">
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : whitelist.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-sm">
              <ShieldCheck size={32} className="mb-2 opacity-20" />
              <p>Belum ada channel di whitelist.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {whitelist.map((item) => (
                <div
                  key={item._id}
                  name="whitelist-item"
                  className="group flex items-center justify-between rounded-lg border bg-gray-50 p-3 hover:bg-white hover:shadow-sm transition-all dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Avatar */}
                    {item.channelThumbnail ? (
                      <img
                        src={item.channelThumbnail}
                        alt="Channel"
                        className="h-9 w-9 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold shrink-0">
                        {(item.channelName || "U").charAt(0)}
                      </div>
                    )}

                    {/* Info Text */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {item.channelName || "Unknown Channel"}
                        </p>
                        <CheckCircle2
                          size={12}
                          className="text-blue-500 shrink-0"
                        />
                      </div>

                      <p className="text-[11px] text-gray-500 truncate font-mono">
                        {item.channelId}
                      </p>

                      {/* Tampilkan Note jika ada */}
                      {item.note && (
                        <p className="text-[10px] text-gray-400 mt-0.5 italic truncate">
                          Note: {item.note}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Hapus dari whitelist"
                  >
                    <Trash2 size={16} />
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
