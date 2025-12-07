# Judi Guard - Frontend 🛡️ (Client-Side)

Selamat datang di direktori frontend untuk proyek Judi Guard. Bagian ini dibangun menggunakan React (dengan Vite) dan bertanggung jawab untuk menyediakan antarmuka pengguna (UI) yang interaktif dan responsif bagi pengguna untuk berinteraksi dengan layanan Judi Guard.

---

## 🛠️ Teknologi & Library Utama

- **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Routing:** [React Router DOM](https.com/package/react-router-dom)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Linting:** [ESLint](https://eslint.org/)
- **Package Manager:** [npm](https://www.npmjs.com/)

---

## 🚀 Panduan Memulai

### 1. Prasyarat

- Pastikan Node.js dan npm sudah terinstal (lebih baik versi terbaru).

---

### 2. Instalasi Dependensi

```sh
npm install atau yarn install atau pnpm install
```

### 3. Konfigurasi Environment Variables

Aplikasi frontend perlu tahu di mana server backend berjalan. Buat file `.env` di dalam direktori `frontend` dan tambahkan variabel berikut.

```ini
# .env file

# URL base untuk API backend
VITE_API_URL=http://localhost:5000/api
```

**Penting:** Variabel di Vite harus diawali dengan `VITE_` agar dapat diakses di kode aplikasi.

---

## 📜 Skrip yang Tersedia

Di dalam direktori proyek, Anda dapat menjalankan:

### `npm run dev`

Menjalankan aplikasi dalam mode development. Buka [http://localhost:5173](http://localhost:5173) (atau port yang ditampilkan di terminal) untuk melihatnya di browser. Halaman akan me-reload secara otomatis jika Anda membuat perubahan.

### `npm run build`

Membangun aplikasi untuk production ke dalam folder `dist`. Perintah ini akan mengoptimalkan build React untuk performa terbaik.

### `npm run lint`

Menjalankan linter untuk memeriksa masalah gaya penulisan kode.

### `npm run test`

Menjalankan test runner (jika pengujian telah dikonfigurasi).

---

## 📂 Struktur Folder

Berikut adalah gambaran umum struktur folder di dalam :

```bash
frontend/
│
├── public/                          # Aset publik yang diakses langsung (favicon, logo, dsb)
├── src/
│   ├── assets/                     # File statis yang dibundel oleh Vite
│   │   ├── icons/                  # Kumpulan ikon
│   │   ├── images/                 # Kumpulan gambar umum
│   │   │   └── team-images/        # Gambar khusus untuk halaman tim
│   │   └── ...                     # Aset tambahan
│   │
│   ├── components/                 # Komponen UI reusable & modular
│   │   ├── auth/                   # Komponen otentikasi
│   │   ├── fun-fact/
│   │   ├── homepage/               # Komponen khusus halaman Home
│   │   ├── layout/                 # Layout umum untuk seluruh aplikasi
│   │   ├── tagline/
│   │   ├── text-predict/
│   │   ├── ui/                     # Komponen UI kustom berbasis shadcn/ui
│   │   ├── PageLoader.jsx
│   │   ├── ThemeProvider.jsx
│   │   └── ThemeToggle.jsx
│   │
│   ├── constants/                  # Data dan konstanta statis
│   │
│   ├── hooks/                      # Custom hooks berbasis fitur (mengikuti arsitektur MVP)
│   │   ├── profile/
│   │   ├── text-predict/
│   │   ├── video-analysis/
│   │   └── ...                     # Hook tambahan (mis. useAuth)
│   │
│   ├── lib/                        # Logika utilitas dan API service
│   │   ├── services/               # Abstraksi komunikasi API
│   │   │   ├── analysis/
│   │   │   ├── auth/
│   │   │   ├── predict/
│   │   │   ├── user/
│   │   │   ├── apiClient.js        # Konfigurasi instance Axios
│   │   │   └── index.js            # Export API service secara terpusat
│   │   └── utils/                  # Fungsi bantu (formatter, validator, helper)
│   │
│   ├── pages/                      # Halaman utama (berbasis route)
│   │   ├── about-us/
│   │   ├── analisis/
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── WorkGuideSection/
│   │   │   └── AnalysisFormSection/
│   │   │       ├── constants/
│   │   │       ├── views/
│   │   │       │   ├── components/
│   │   │       └── AnalysisFormSection.jsx
│   │   ├── auth/                   # Halaman otentikasi
│   │   ├── home/
│   │   ├── profile/                # Halaman & form profil user
│   │   ├── status/                 # Halaman status/error
│   │   └── otp/                    # (opsional, jika halaman OTP terpisah)
│   │
│   ├── routes/                     # Routing aplikasi
│   │   ├── AppRouter.jsx           # Daftar rute utama aplikasi
│   │   └── ProtectedRoute.jsx      # Proteksi rute (autentikasi)
│   │
│   ├── store/                      # State management (Zustand)
│   │   ├── analysis/
│   │   │   └── videoAnalysisStore.js
│   │   ├── auth/
│   │   │   └── authStore.js
│   │   ├── predict/
│   │   │   └── textPredictStore.js
│   │   ├── user/
│   │   │   └── userStore.js
│   │   └── index.js
│   │
│   ├── App.jsx                     # Komponen root aplikasi
│   ├── main.jsx                    # Titik masuk utama aplikasi (ReactDOM.render)
│   └── style.css                   # Styling global aplikasi
│
├── .env                            # Variabel lingkungan
├── .env.example                    # Contoh konfigurasi env
├── .gitignore
├── components.json                 # Konfigurasi shadcn/ui
├── eslint.config.json              # Konfigurasi ESLint
├── jsconfig.json                   # Path alias dan konfigurasi JS/TS
├── index.html                      # Template HTML utama (Vite)
├── package.json                    # Daftar dependensi & script NPM
├── README.md                       # Dokumentasi proyek
├── tailwind.config.js              # Konfigurasi TailwindCSS
└── vite.config.js                  # Konfigurasi Vite bundler
```

Struktur ini dirancang untuk menjaga kode tetap terorganisir dan mudah untuk dikelola seiring dengan pertumbuhan aplikasi.

## 📚 Dokumentasi Lengkap

Lihat dokumentasi teknis di folder [`/docs`](./docs):

- [Setup & Environment](./docs/setup.md)
- [Arsitektur Proyek (MVP)](./docs/architecture.md)
- [Strategi Testing (TDD + BDD)](./docs/testing.md)
- [API Service](./docs/api.md)
- [Manajemen State (Zustand)](./docs/state-management.md)

## Author

Ali Musthafa Kamal
