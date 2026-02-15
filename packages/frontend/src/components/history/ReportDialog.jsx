import { useState } from "react";
import { useHistoryStore } from "@/stores/historyStore";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Download,
  FileBarChart,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function ReportDialog() {
  const {
    generatePreview,
    downloadPeriodPDF,
    reportPreview,
    isLoadingPreview,
    resetPreview,
  } = useHistoryStore();

  const [date, setDate] = useState(null); // { from, to }

  const handleOpenChange = (open) => {
    if (!open) {
      resetPreview(); // Bersihkan data saat tutup
      setDate(null);
    }
  };

  const onGenerateClick = () => {
    if (date?.from && date?.to) {
      generatePreview(date);
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <FileBarChart size={16} />
          Laporan Periode
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cetak Laporan Aktivitas</DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal untuk melihat ringkasan kinerja moderasi spam.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 1. DATE PICKER SECTION */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Pilih Periode
            </label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd MMM y", { locale: id })} -{" "}
                          {format(date.to, "dd MMM y", { locale: id })}
                        </>
                      ) : (
                        format(date.from, "dd MMM y", { locale: id })
                      )
                    ) : (
                      <span>Pilih Tanggal Mulai - Selesai</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    className=" sm:w-[350px]"
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={onGenerateClick}
                disabled={!date?.from || !date?.to || isLoadingPreview}
              >
                {isLoadingPreview ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Preview"
                )}
              </Button>
            </div>
          </div>

          {/* 2. PREVIEW SECTION (MUNCUL SETELAH GENERATE) */}
          {reportPreview && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard
                  title="Total Video"
                  value={reportPreview.summary.totalVideos}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                />
                <StatCard
                  title="Total Komentar"
                  value={reportPreview.summary.totalComments}
                  bgColor="bg-gray-50"
                  textColor="text-gray-700"
                />
                <StatCard
                  title="Spam Ditemukan"
                  value={reportPreview.summary.totalSpam}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                />
              </div>

              {/* Mini Table Preview */}
              <div className="rounded-md border text-sm">
                <div className="bg-gray-50 px-4 py-2 font-medium border-b flex justify-between">
                  <span>Video Terakhir Dianalisis</span>
                  <span className="text-gray-500 text-xs">
                    Menampilkan maks 5
                  </span>
                </div>
                <div className="divide-y max-h-[200px] overflow-y-auto">
                  {reportPreview.details.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-xs">
                      Tidak ada aktivitas pada periode ini.
                    </div>
                  ) : (
                    reportPreview.details.slice(0, 5).map((item) => (
                      <div
                        key={item._id}
                        className="px-4 py-2 flex justify-between items-center"
                      >
                        <div className="truncate max-w-[250px]">
                          <div className="font-medium text-gray-900 truncate">
                            {item.videoTitle}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {format(
                              new Date(item.requestedAt),
                              "dd MMM, HH:mm",
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-xs font-bold ${item.totalSpamDetected > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {item.totalSpamDetected} Spam
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. DOWNLOAD BUTTON */}
              <Button
                className="w-full gap-2 mt-2"
                onClick={() => downloadPeriodPDF(date)}
                disabled={reportPreview.summary.totalVideos === 0}
              >
                <Download size={16} />
                Download PDF Lengkap
              </Button>
            </div>
          )}

          {/* Empty State / Hint */}
          {!reportPreview && !isLoadingPreview && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400 border-2 border-dashed rounded-lg">
              <FileBarChart className="h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm">Silakan pilih tanggal dan klik Preview</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Sub-component Stat Card
function StatCard({ title, value, bgColor, textColor }) {
  return (
    <div className={`rounded-lg p-3 text-center ${bgColor}`}>
      <div className={`text-xs font-medium opacity-70 ${textColor}`}>
        {title}
      </div>
      <div className={`text-xl font-bold ${textColor}`}>{value}</div>
    </div>
  );
}
