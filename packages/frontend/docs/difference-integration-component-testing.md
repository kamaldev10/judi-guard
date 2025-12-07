Ini adalah pertanyaan fundamental yang sangat bagus, dan kebingungan ini sangat wajar. Batasan ini seringkali menjadi area abu-abu.

Jawaban terbaik dan paling modern untuk membedakan keduanya, terutama dalam ekosistem React, berasal dari filosofi **"Testing Trophy"** yang dipopulerkan oleh **Kent C. Dodds**.

Batasan pembedanya adalah: **Isolasi vs. Integrasi Sistem-Mini.**

---

## 1. Tes Komponen (Component Test) ⚙️

**Tujuan Utama:** Memverifikasi bahwa satu komponen (atau satu "widget" UI) bekerja dengan benar **secara terisolasi**.

**Analogi:** Menguji satu **roda gigi** ⚙️. Apakah bentuknya benar? Apakah berputar mulus di porosnya? Kita tidak peduli roda gigi lain yang terhubung dengannya.

- **Apa yang Diuji:**
  - UI yang di-render (Apakah teks, gambar, dan _style_ dasar muncul?).
  - Interaksi dengan _state_ **lokal** (misalnya `useState`).
  - Bagaimana komponen merespons _props_ (misalnya, `isLoading={true}` harus menampilkan _spinner_).
  - _Event handler_ sederhana yang didefinisikan _di dalam_ komponen.

- **Batasan Paling Penting (Apa yang di-Mock):**
  - Tes Komponen **ME-MOCK SEMUA DEPENDENSI EKSTERNAL**.
  - Jika komponen Anda memanggil `useTextPredictStore()`, Anda **me-mock** _store_ tersebut.
  - Jika komponen Anda memanggil `useNavigate()`, Anda **me-mock** _router_.
  - Jika komponen Anda memanggil _hook_ kustom (seperti `useEditProfilePresenter`), Anda **me-mock** _hook_ tersebut.

- **Contoh di Proyek Anda:**
  - Tes untuk **`EditProfileForm.jsx`** (komponen "bodoh") adalah **Tes Komponen** murni. Kita akan memberinya _props_ `isSaving={true}` dan berharap tombolnya `disabled`. Kita akan mengklik "Simpan" dan berharap `props.onSubmit` dipanggil.

---

## 2. Tes Integrasi (Integration Test) 📦

**Tujuan Utama:** Memverifikasi bahwa **beberapa unit (modul) bekerja sama** dengan benar untuk menghasilkan sebuah fitur. Ini adalah lapisan pengujian paling penting untuk _frontend_.

**Analogi:** Menguji **gearbox (kotak persneling)** 📦. Kita tidak lagi menguji satu roda gigi, kita menguji _apakah semua roda gigi, tuas, dan poros bekerja sama_. Saat Anda menggerakkan tuas (input pengguna), apakah poros keluaran (UI) berputar seperti yang diharapkan?

- **Apa yang Diuji (Jawaban untuk Anda: "ui-store-utils"):**
  - **YA, TEPAT SEKALI.** Tes integrasi memverifikasi "kabel" 🔌 di antara:
    - **UI + Store:** (Misalnya, `TextPredictForm` + `useTextPredictStore`).
    - **UI + Hook Logika/Presenter:** (Misalnya, `EditProfilePage` + `useEditProfilePresenter`).
    - **UI + Router:** (Misalnya, mengklik _link_ dan memverifikasi halaman baru di-render).
    - **UI + API Layer:** (Misalnya, mengklik tombol _login_ dan memverifikasi _hook_ API Anda dipanggil).

- **Batasan Paling Penting (Apa yang di-Mock):**
  - Tes Integrasi **TIDAK ME-MOCK** dependensi _frontend_ (store, router, hook).
  - Tes Integrasi **HANYA ME-MOCK "DUNIA LUAR"**—yaitu, **jaringan (network) / backend API**. (Inilah mengapa _tools_ seperti Mock Service Worker (MSW) sangat ideal untuk lapisan ini).

- **Contoh di Proyek Anda:**
  - Tes untuk **`EditProfilePage.jsx`** (komponen "pintar") adalah **Tes Integrasi**. Kita **tidak** akan me-mock `useEditProfilePresenter`. Sebaliknya, kita akan **me-mock _fetch/axios_ (API)** yang dipanggil _di dalam_ _hook_ tersebut.
  - Tes ini akan memverifikasi: "Saat _hook_-nya `isLoading`, apakah _spinner_ muncul? Saat pengguna mengklik 'Simpan', apakah _hook_-nya memanggil API, dan apakah tombolnya menjadi _disabled_?"

---

## Tabel Batasan Pembeda

| Aspek                  | Tes Komponen (Component Test)                          | Tes Integrasi (Integration Test)                             |
| :--------------------- | :----------------------------------------------------- | :----------------------------------------------------------- |
| **Tujuan**             | Menguji 1 unit UI secara **isolasi**.                  | Menguji **interaksi** antar beberapa unit (UI, Store, Hook). |
| **Fokus**              | Apakah komponen me-render & merespons _props_?         | Apakah "kabel" antar sistem berfungsi?                       |
| **Apa yang di-Mock?**  | **Dependensi Eksternal** (Stores, Hooks, Router, API). | **Hanya Dunia Luar** (Backend API/Network).                  |
| **Contoh Proyek Anda** | `EditProfileForm.spec.jsx` (komponen bodoh).           | `EditProfilePage.integration.spec.jsx` (halaman pintar).     |
| **Kepercayaan Diri**   | Rendah (Hanya membuktikan 1 roda gigi benar).          | **Tinggi** (Membuktikan fitur Anda bekerja dari A-Z).        |

Modularisasi yang Anda usulkan (Container/Presentational) sangat sempurna karena **menciptakan batasan alami** ini untuk pengujian. Anda dapat dengan mudah melakukan _Component Test_ pada komponen bodoh dan _Integration Test_ pada komponen pintar.

Pertanyaan Anda sangat bagus dan menyentuh inti dari strategi pengujian modern! 👍

Singkatnya: Kita **memilih** untuk menguji `AnalysisSummary` sebagai **Tes Komponen** (dengan me-mock anak-anaknya) untuk **kecepatan, isolasi, dan stabilitas**. Jika kita **tidak** me-mock anak-anaknya (`StatBox`, `AnalysisLegend`, `recharts`), maka itu **akan menjadi Tes Integrasi**.

Kapan harus _mock_ dan kapan tidak, itu **tergantung pada tujuan tes** yang sedang Anda tulis, sesuai dengan lapisan Piramida Pengujian atau Trofi Pengujian (Testing Trophy). 🏆

---

## Kapan Harus Mock? (Fokus: Tes Komponen) ⚙️

Anda **me-mock** dependensi **eksternal** (komponen anak, _hooks_, _store_, API) ketika tujuan Anda adalah menguji **satu unit UI secara terisolasi**.

- **Tujuan:** Memverifikasi bahwa **komponen yang sedang diuji** (misalnya `AnalysisSummary`) berfungsi dengan benar _sendirian_. Apakah ia memproses _props_? Apakah ia me-_render_ struktur dasar? Apakah ia memanggil _callback_?
- **Asumsi:** Kita berasumsi bahwa komponen anak (`StatBox`, `AnalysisLegend`) dan _library_ (`recharts`) sudah berfungsi dengan benar (karena mereka punya tesnya sendiri). Kita tidak perlu menguji _ulang_ fungsionalitas mereka di dalam tes `AnalysisSummary`.
- **Keuntungan Mocking di Tes Komponen:**
  - **Isolasi:** Jika ada bug di `StatBox`, tes `AnalysisSummary` tidak akan ikut gagal. Kita tahu persis di mana masalahnya.
  - **Kecepatan:** Me-render _mock_ sederhana jauh lebih cepat daripada me-render `PieChart` asli dengan segala logikanya. Tes berjalan lebih cepat, _feedback_ lebih cepat. ⚡
  - **Stabilitas:** Jika implementasi internal `AnalysisLegend` berubah (misalnya, _class_ CSS), tes `AnalysisSummary` tidak akan rusak selama _props_ yang diterimanya masih sama. Tes jadi lebih tahan lama terhadap _refactoring_.
  - **Kesederhanaan:** Lebih mudah untuk fokus pada logika spesifik `AnalysisSummary` tanpa "kebisingan" dari komponen anak.

- **Contoh:** Dalam tes `AnalysisSummary` kita, kita me-mock `StatBox`. Kita hanya peduli `AnalysisSummary` memanggil `StatBox` dengan _prop_ `label="Total Komentar"` dan `value="50"`. Kita tidak peduli _bagaimana_ `StatBox` menampilkan "50".

---

## Kapan TIDAK Mock? (Fokus: Tes Integrasi) 📦

Anda **tidak me-mock** dependensi **internal** (komponen anak, _hooks_ dalam _frontend_, _store_) ketika tujuan Anda adalah menguji **bagaimana beberapa unit bekerja sama** untuk menyelesaikan sebuah fitur atau alur kerja.

- **Tujuan:** Memverifikasi bahwa **komponen-komponen berinteraksi** dengan benar. Apakah data mengalir dengan benar dari _parent_ ke _child_? Apakah _state_ di _store_ diperbarui saat tombol di UI diklik, dan apakah UI lain merespons pembaruan itu?
- **Asumsi:** Kita ingin memastikan "sambungan" antar komponen berfungsi.
- **Apa yang Tetap di-Mock:** Dalam tes integrasi _frontend_, kita biasanya **hanya me-mock batas sistem**, yaitu **jaringan (API backend)**. Kita tidak ingin tes kita bergantung pada _server_ eksternal.
- **Keuntungan TIDAK Mocking di Tes Integrasi:**
  - **Kepercayaan Diri Tinggi:** Ini adalah jenis tes yang paling berharga. Jika tes integrasi lolos, Anda jauh lebih yakin bahwa fitur tersebut benar-benar berfungsi seperti yang diharapkan pengguna. Ia menangkap _bug_ yang terjadi akibat interaksi antar modul. ✅
  - **Realistis:** Mensimulasikan penggunaan aplikasi lebih dekat dengan kondisi nyata.
  - **Menangkap Mismatch Antarmuka:** Jika `AnalysisSummary` mengirim _prop_ `data={...}` tetapi `AnalysisLegend` mengharapkan `payload={...}`, tes komponen (dengan mock) mungkin lolos, tetapi tes integrasi (tanpa mock) akan gagal.

- **Contoh:** Tes untuk `ContactSection` (yang pintar) adalah tes integrasi. Kita **tidak** me-mock `ContactInfoList` dan `ContactForm` (di versi refaktor terakhir kita), tetapi kita me-mock API `toast`. Tujuannya adalah memastikan _state_ di `ContactSection` diperbarui saat `onChange` dari `ContactForm` dipanggil, dan `toast` dipanggil saat `onSubmit` selesai.

---

## Kesimpulan: Fundamental Pembeda

- **Tes Komponen:** Fokus pada **satu unit**, **isolasi** tinggi, **mock** dependensi eksternal (anak, _hooks_, _store_, API). Memberi _feedback_ cepat tapi kepercayaan diri rendah.
- **Tes Integrasi:** Fokus pada **interaksi beberapa unit**, **kolaborasi**, **jangan mock** dependensi internal _frontend_ (anak, _hooks_, _store_), **mock** hanya batas sistem (API/network). Memberi _feedback_ sedikit lebih lambat tapi kepercayaan diri **tinggi**.

Jadi, keputusan untuk me-mock `StatBox`, `AnalysisLegend`, dan `recharts` dalam tes `AnalysisSummary` adalah pilihan sadar untuk menjadikannya **Tes Komponen** yang cepat dan terisolasi, dengan asumsi komponen/library tersebut sudah diuji di tempat lain. Anda _bisa saja_ menulis **Tes Integrasi** untuk `AnalysisSummary` tanpa me-mock anak-anaknya, tetapi tes itu akan lebih kompleks dan lambat.
