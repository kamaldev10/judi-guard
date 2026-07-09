import {
  ShieldCheck,
  Cpu,
  Youtube,
  ScanSearch,
  Database,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Guide() {
  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* --- HEADER SECTION --- */}
      <div className="border-b pb-6 dark:border-gray-800">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panduan & Dokumentasi Sistem
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Pahami cara kerja "Hybrid Engine" Judi Guard dan pelajari langkah demi langkah
          membersihkan channel Anda dari spam.
        </p>
      </div>

      {/* --- BAGIAN 1: RANGKUMAN SISTEM (ARCHITECTURE) --- */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
          <Cpu className="text-blue-600" />
          Cara Kerja Sistem (Behind The Scene)
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card 1: Hybrid Engine */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
              1. Hybrid Intelligence Engine
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sistem kami tidak hanya menebak. Kami menggabungkan dua kekuatan:
            </p>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex gap-2  bg-gray-50 p-3 dark:bg-gray-900 rounded-lg">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                <span>
                  <strong>AI Probabilistik (Python) :</strong> Memahami konteks kalimat (misal:
                  "Gacor", "Pola", "Maxwin") meskipun disamarkan.
                </span>
              </li>
              <li className="flex gap-2 bg-gray-50 p-3 dark:bg-gray-900 rounded-lg">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                <span>
                  <strong>Rule-Based Deterministik :</strong> Pengecekan pasti berdasarkan
                  Whitelist, Blacklist, dan pola Regex (No HP/Link).
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Workflow */}
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
              2. Alur Data & Privasi
            </h3>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <Youtube size={20} className="text-red-600" />
                <span>
                  <strong>Harvesting : </strong> Mengambil data komentar via YouTube API secara
                  legal.
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <Database size={20} className="text-purple-600" />
                <span>
                  <strong>Processing : </strong> Analisis dilakukan di server kami, hasil disimpan
                  di database terenkripsi.
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <ShieldCheck size={20} className="text-blue-600" />
                <span>
                  <strong>Action :</strong> Aksi Hapus/Blokir hanya dilakukan atas perintah Anda
                  (User Triggered).
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BAGIAN 2: PANDUAN PENGGUNA (USER GUIDE) --- */}
      <section className="space-y-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white border-t pt-8 dark:border-gray-800">
          <FileText className="text-blue-600" />
          Panduan Penggunaan Fitur
        </h2>

        {/* GUIDE 1: SETUP */}
        <div className="rounded-xl border border-l-4 border-l-blue-500 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              1
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Persiapan & Koneksi (Wajib)
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                Sebelum memulai moderasi, sistem membutuhkan izin akses ("Token") untuk menghapus
                komentar atas nama Anda.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-900 text-sm">
                  <strong>Langkah 1:</strong> Klik tombol{' '}
                  <span className="text-red-600 font-bold">Connect Channel</span> di pojok kanan
                  atas Dashboard.
                </div>
                <div className="bg-gray-50 p-3 rounded-md dark:bg-gray-900 text-sm">
                  <strong>Langkah 2:</strong> Login dengan akun Google yang memiliki channel YouTube
                  target. Izinkan akses kelola komentar.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GUIDE 2: CONFIGURATION */}
        <div className="rounded-xl border border-l-4 border-l-orange-500 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              2
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Konfigurasi Whitelist & Blacklist (Pencegahan)
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                Ajari AI mana yang teman (aman) dan mana yang musuh (spam spesifik).
              </p>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <ShieldCheck size={16} /> Whitelist (Daftar Putih)
                  </h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      Komentar dari channel ini <strong>TIDAK AKAN PERNAH</strong> dianggap spam.
                    </li>
                    <li>
                      <span className="font-semibold text-blue-600">Fitur Cerdas:</span> Anda bisa
                      memasukkan Username (contoh:{' '}
                      <code className="bg-gray-100 px-1 rounded">@gadgetin</code>
                      ), sistem akan otomatis mencari Channel ID-nya.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <AlertTriangle size={16} /> Blacklist (Daftar Hitam)
                  </h4>
                  <ul className="mt-2 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                      Tambahkan kata kunci spesifik yang sering lolos (misal singkatan judi baru:
                      "J-P", "S-L-O-T").
                    </li>
                    <li>
                      Mendukung <strong>Bulk Input</strong>: Masukkan banyak kata sekaligus dan
                      tekan simpan.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GUIDE 3: ANALYSIS */}
        <div className="rounded-xl border border-l-4 border-l-green-500 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              3
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eksekusi Analisis & Moderasi
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                Inti dari aplikasi ini. Tempel link, tunggu hasil, dan bersihkan.
              </p>
              <ol className="mt-4 list-decimal pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  Buka menu <strong>Analisis Video</strong>.
                </li>
                <li>Tempel (Paste) URL video YouTube Anda.</li>
                <li>Tunggu Loading Bar selesai (Sistem sedang membaca ribuan komentar).</li>
                <li>
                  Lihat hasil di tabel. Anda bisa memfilter berdasarkan{' '}
                  <strong>Risk Level (High/Medium)</strong>.
                </li>
                <li>
                  Pilih aksi:
                  <span className="mx-1 inline-block rounded border bg-gray-50 px-2 py-0.5 text-xs font-bold text-red-600">
                    Hapus Komentar
                  </span>
                  untuk menghapus komentar, atau pilih checklist
                  <span className="mx-1 inline-block rounded border bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-600">
                    Block User
                  </span>
                  untuk memblokir pengirimnya selamanya.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* GUIDE 4: REPORTING */}
        <div className="rounded-xl border border-l-4 border-l-purple-500 bg-white p-6 shadow-sm dark:bg-gray-950 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              4
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Riwayat & Laporan
              </h3>
              <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm">
                Bukti kerja dan fitur keselamatan.
              </p>
              <ul className="mt-4 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <strong>History:</strong> Lihat kembali video mana saja yang sudah dibersihkan.
                </li>
                <li>
                  <strong>Undo Action:</strong> Tidak sengaja menghapus komentar fans? Gunakan fitur
                  Undo di halaman detail analisis untuk mengembalikannya.
                </li>
                <li>
                  <strong>Export PDF:</strong> Unduh laporan resmi hasil moderasi untuk keperluan
                  dokumentasi atau laporan ke atasan/klien.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA BOTTOM --- */}
      <div className="mt-8 flex justify-center pt-6">
        <Link to="/dashboard/analysis">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Search className="mr-2 h-5 w-5" />
            Saya Mengerti, Mulai Analisis Sekarang
          </Button>
        </Link>
      </div>
    </div>
  );
}
