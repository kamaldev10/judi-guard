# Rencana Migrasi Backend: ESM (ECMAScript Modules) & Feature Module Folder Structure

Dokumen ini berisi rencana arsitektur dan langkah-langkah detail untuk memigrasikan backend Judi Guard dari CommonJS (CJS) ke ESM, serta merestrukturisasi folder dari arsitektur berorientasi lapisan (Layer-based) ke berorientasi fitur (Feature Module) dengan menerapkan pemisahan tanggung jawab (_Separation of Concerns_) yang lebih ketat.

---

## 1. Konvensi Penamaan Bersih (Clean Code Naming Conventions)

Mengikuti prinsip _Clean Code_ dari Robert C. Martin (Uncle Bob), kita menetapkan konvensi penamaan yang seragam di seluruh backend untuk meningkatkan keterbacaan (_readability_) dan kemudahan pencarian (_searchability_).

### A. Penamaan File dan Folder

- **Format**: Menggunakan **kebab-case** secara konsisten.
- **Folder**: `video-analysis`, `text-predict`, `shared`.
- **File**: `auth.controller.js`, `password-reset.model.js`, `jwt.js`.
- **Suffix/Ekstensi**: Menambahkan suffix tipe file untuk memperjelas perannya:
  - `*.routes.js` untuk file routing Express.
  - `*.controller.js` untuk handler HTTP request.
  - `*.service.js` untuk business logic.
  - `*.repository.js` untuk data access logic.
  - `*.model.js` untuk skema database/Mongoose.
  - `*.validator.js` untuk skema validasi Joi.

### B. Penamaan Simbol Kode (Variabel, Fungsi, Kelas, Konstanta)

- **Kelas/Constructor**: **PascalCase** berupa kata benda (contoh: `UserRepository`, `VideoAnalysisModel`).
- **Fungsi/Metode**: **camelCase** berupa kata kerja yang deskriptif dan menunjukkan intensi (contoh: `verifyOtpCode()`, `findUserByEmail()`, `isPasswordMatch()`).
- **Variabel/Objek**: **camelCase** berupa kata benda atau kata sifat yang menggambarkan isinya (contoh: `currentUser`, `isValidOtp`).
- **Variabel Boolean**: Menggunakan prefix `is`, `has`, `should`, atau `can` (contoh: `isVerified`, `hasYoutubeAccess`).
- **Konstanta**: **UPPER_SNAKE_CASE** (contoh: `MAX_TOP_LEVEL_COMMENTS`, `JWT_EXPIRES_IN`).

---

## 2. Pemisahan Tanggung Jawab (Separation of Concerns)

Untuk memisahkan logika bisnis dari mekanisme penyimpanan data (database), kita menerapkan **Repository Pattern**. Berikut adalah pembagian lapisan tanggung jawab dalam setiap modul fitur:

```
┌──────────────────────────────────────────────┐
│            Routing Layer (*.routes.js)       │
└──────────────────────┬───────────────────────┘
                       │ HTTP Request / Response
┌──────────────────────▼───────────────────────┐
│         Controller Layer (*.controller.js)   │
└──────────────────────┬───────────────────────┘
                       │ Data DTO / Raw Input
┌──────────────────────▼───────────────────────┐
│           Service Layer (*.service.js)       │ ◄─── Berinteraksi dengan External API
└──────────────────────┬───────────────────────┘      (YouTube, ML API)
                       │ Domain Objects / Query
┌──────────────────────▼───────────────────────┐
│         Repository Layer (*.repository.js)   │
└──────────────────────┬───────────────────────┘
                       │ Mongoose Queries
┌──────────────────────▼───────────────────────┐
│             Model Layer (*.model.js)         │ ◄─── Mongoose Schema & DB Constraints
└──────────────────────────────────────────────┘
```

### Rationale & Rekomendasi:

- **Controller (HTTP Layer)**: Hanya bertugas menerima request HTTP, memicu middleware validasi, memanggil service yang sesuai, dan menyusun HTTP response (status code & JSON structure). Tidak boleh berisi logika bisnis atau query database.
- **Service (Business Logic Layer)**: Berisi aturan bisnis utama Judi Guard (misal: validasi bisnis OTP, inisiasi klasifikasi AI, moderasi YouTube). Service memanggil Repository untuk mengambil/menyimpan data dan memanggil API eksternal. Layer ini tidak peduli _bagaimana_ data disimpan di database.
- **Repository (Data Access Layer)**: Tempat berkumpulnya query Mongoose (seperti `findById`, `findOne`, `create`). Jika di masa depan database bermigrasi dari MongoDB ke PostgreSQL, kita hanya perlu mengubah file `*.repository.js` tanpa menyentuh file `*.service.js`.
- **Model (Data Layer)**: Mendefinisikan skema Mongoose beserta indeks, validasi level database, dan pre/post hooks.

---

## 3. Struktur Folder Baru Kebab-Case (`src/`)

```
src/
├── app/
│   ├── api.routes.js              # Router utama (/api/*)
│   ├── app.js
│   └── server.js
├── config/
│   ├── database.js
│   └── environment.js
├── middlewares/                    # Shared middlewares
│   ├── error-handler.js
│   ├── require-auth.js             # JWT auth + workspace auto-init
│   ├── require-permission.js       # RBAC permission checker
│   ├── require-youtube-access.js   # YouTube token verify & auto-refresh
│   └── validate-request.js         # Joi validation wrapper
├── modules/                        # FEATURE MODULES (Kebab-Case)
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   ├── auth.service.js
│   │   ├── auth.validator.js
│   │   └── password-reset.model.js
│   │   └── password-reset.repository.js
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   ├── user.repository.js
│   │   └── user.model.js
│   ├── video-analysis/
│   │   ├── video-analysis.controller.js
│   │   ├── video-analysis.routes.js
│   │   ├── video-analysis.service.js
│   │   ├── video-analysis.repository.js
│   │   ├── video-analysis.validator.js
│   │   ├── video-analysis.model.js
│   │   ├── analyzed-comment.model.js
│   │   ├── analyzed-comment.repository.js
│   │   └── comment-processor.service.js
│   ├── text-predict/
│   │   ├── text-predict.controller.js
│   │   └── text-predict.routes.js
│   ├── studio/
│   │   ├── studio.controller.js
│   │   ├── studio.routes.js
│   │   └── studio.service.js
│   ├── channel/
│   │   ├── channel.controller.js
│   │   ├── channel.routes.js
│   │   ├── channel.service.js
│   │   └── channel.validator.js
│   ├── configuration/
│   │   ├── configuration.controller.js
│   │   ├── configuration.routes.js
│   │   ├── configuration.service.js
│   │   ├── configuration.repository.js
│   │   └── configuration.model.js
│   └── workspace/                   # BARU: RBAC multi-tenant
│       ├── workspace.controller.js
│       ├── workspace.routes.js
│       ├── workspace.service.js
│       ├── workspace.repository.js
│       ├── workspace.model.js
│       └── workspace.validator.js
├── shared/
│   ├── clients/
│   │   ├── google-oauth2.client.js # Google OAuth 2.0 client
│   │   └── ml-api.client.js        # Instance Axios untuk ML API
│   ├── constants/
│   │   └── gambling-keywords.js
│   ├── services/
│   │   ├── youtube.service.js      # Shared YouTube API wrapper
│   │   └── ai.service.js           # Shared AI core processing
│   └── utils/
│       ├── comment-processor.js
│       ├── email-sender.js
│       ├── errors.js
│       ├── jwt.js
│       ├── pdf-generator.js
│       └── youtube-helper.js
```

---

## 4. Langkah-Langkah Migrasi Berwaktu (Phased Migration)

```
[Fase 1: Persiapan & Konfigurasi ESM]  <-- Selesai ✅
         │
         ▼
[Fase 2: Migrasi Kode CJS ke ESM secara Bertahap] ✅
         │
         ▼
[Fase 3: Pemisahan Data Access ke Repository & Model] ✅
         │
         ▼
[Fase 4: Restrukturisasi Folder & Renaming ke Kebab-Case] ✅
         │
         ▼
[Fase 5: Penyesuaian Impor Path & Subpath] ✅
         │
         ▼
[Fase 6: Validasi & Testing] ✅
```

### Fase 1: Persiapan & Konfigurasi ESM (Selesai ✅)

1. Menambahkan `"type": "module"` ke `package.json`.
2. Menghapus `module-alias` dan mendefinisikan `"imports"` dengan prefix `#*` di `package.json` untuk subpath imports.
3. Mengubah eslint (`eslint.config.mjs`) untuk menyadari sintaks ESM (`sourceType: 'module'`).
4. Membuat `jsconfig.json` agar auto-complete import alias dapat terbaca di IDE.

### Fase 2: Migrasi Kode CJS ke ESM secara Bertahap (Selesai ✅)

1. [x] Migrasikan file utilitas dasar (`shared/utils/*`) ke ESM:
   - `errors.js` (Selesai ✅)
   - `jwt.js` (Selesai ✅)
   - `youtube-helper.js` (Selesai ✅)
   - `email-sender.js` (Selesai ✅)
   - `pdf-generator.js` (Selesai ✅)
2. [x] Ganti semua `require` menjadi `import` di seluruh file sisa (modules, controllers, routes, config) (Selesai ✅).
3. [x] Tambahkan `.js` di akhir setiap import lokal/file internal (Selesai ✅).
4. [x] Ubah semua `module.exports = ...` menjadi `export default ...` atau named `export const ...` (Selesai ✅).

### Fase 3: Pemisahan Data Access ke Repository (Selesai ✅)

1. [x] Buat class Repository baru untuk mengemas query database Mongoose (Selesai ✅).
2. [x] Pindahkan query Mongoose langsung dari Service ke Repository masing-masing (Selesai ✅).

### Fase 4: Restrukturisasi Folder & Renaming ke Kebab-Case (Selesai ✅)

1. [x] Re-organisasi & migrasi model / validator:
   - `AnalyzedComment.model.js` -> `src/modules/video-analysis/analyzed-comment.model.js` (Selesai ✅)
   - `video.validator.js` -> `src/modules/video-analysis/video-analysis.validator.js` (Selesai ✅)
   - `comment.model.js` (Dihapus karena tidak digunakan / YAGNI 🗑️)
   - `video.model.js` (Dihapus karena tidak digunakan / YAGNI 🗑️)
2. [x] Buat folder sub-fitur lainnya di bawah `src/modules/` dan `src/shared/` (Selesai ✅).
3. [x] Pindahkan dan ganti nama file sisa menjadi kebab-case (Selesai ✅).

### Fase 5: Penyesuaian Impor Path & Subpath (Selesai ✅)

1. [x] Ganti semua relative import yang panjang menjadi subpath imports yang clean (Selesai ✅).
2. [x] Sesuaikan semua impor relatif internal yang rusak akibat pemindahan file (Selesai ✅).

### Fase 6: Validasi & Testing (Selesai ✅)

1. [x] Jalankan linter (`npm run lint`) untuk mendeteksi error sintaks atau referensi (Selesai ✅).
2. [x] Jalankan unit test (`npm run test`) dan server dev (`npm run dev`) untuk memverifikasi fungsionalitas aplikasi (Selesai ✅).

---

_Spesifikasi Selesai: 10 Juli 2026_
_🔒 Dokumen ini telah diverifikasi dan dikunci — semua fase (1–6) telah selesai dilaksanakan._
