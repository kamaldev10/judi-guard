# 🏗️ Arsitektur Frontend Judi Guard

## Pola Desain: Model–View–Presenter (MVP)

Struktur ini memisahkan logika presentasi (Presenter) dari tampilan (View) agar lebih mudah di-testing dan di-maintain.

---

### 1. Struktur Utama

```sh
src/
├── components/ # View/UI
├── hooks/ # Presenter (logika interaksi)
├── lib/services/ # Model (komunikasi API)
├── lib/utils/ # utilitas
├── store/ # Global state (Zustand)
└── pages/ # Halaman utama
```

---

### 2. Alur Data

1. **View (komponen React)** → menerima input user
2. **Presenter (custom hook)** → memproses input, validasi, dan memanggil API
3. **Model (service)** → mengirim/menerima data dari backend
4. **Store (Zustand)** → menyimpan state global

---

### 3. Keuntungan Arsitektur MVP

- Komponen UI menjadi **lebih bersih & reusable**.
- Testing lebih mudah karena logika terpisah dari view.
- Cocok untuk pendekatan **TDD (Test-Driven Development)**.

---

## 📂 Struktur Folder Lengkap

Berikut adalah gambaran umum struktur folder :

```sh
frontend/
│
├── public/
│   └── logo.png                    # Aset publik yang diakses langsung (favicon, logo, dsb)
│
├── src/
│   ├── assets/                     # File statis yang dibundel oleh Vite
│   │   ├── icons/                  # Kumpulan ikon
│   │   ├── images/                 # Kumpulan gambar umum
│   │   │   └── team-images/        # Gambar khusus untuk halaman tim
│   │   └── ...                     # Aset tambahan
│   │
│   ├── components/                 # Komponen UI reusable & modular
│   │   ├── auth/                   # Komponen otentikasi
│   │   │   └── GoogleSignInButton.jsx
│   │   ├── fun-fact/
│   │   │   └── FunFactsSection.jsx
│   │   ├── homepage/               # Komponen khusus halaman Home
│   │   │   ├── ConnectSection.jsx
│   │   │   ├── ContactSection.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── TextPredictSection.jsx
│   │   │   └── TestimonialsSection.jsx
│   │   ├── layout/                 # Layout umum untuk seluruh aplikasi
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   └── MainLayout.jsx
│   │   ├── tagline/
│   │   │   └── Tagline.jsx
│   │   ├── text-predict/
│   │   │   ├── PredictResult.jsx
│   │   │   └── TextPredictForm.jsx
│   │   ├── ui/                     # Komponen UI kustom berbasis shadcn/ui
│   │   ├── PageLoader.jsx
│   │   ├── ThemeProvider.jsx
│   │   └── ThemeToggle.jsx
│   │
│   ├── constants/                  # Data dan konstanta statis
│   │   └── index.js
│   │
│   ├── hooks/                      # Custom hooks berbasis fitur (mengikuti arsitektur MVP)
│   │   ├── profile/
│   │   │   ├── useProfilePresenter.js
│   │   │   └── useEditProfilePresenter.js
│   │   ├── text-predict/
│   │   │   └── useTextPredict.js
│   │   ├── video-analysis/
│   │   │   └── useVideoAnalysis.js
│   │   └── ...                     # Hook tambahan (mis. useAuth)
│   │
│   ├── lib/                        # Logika utilitas dan API service
│   │   ├── services/               # Abstraksi komunikasi API
│   │   │   ├── analysis/
│   │   │   │   └── videoAnalysisApi.js
│   │   │   ├── auth/
│   │   │   │   └── authApi.js
│   │   │   ├── predict/
│   │   │   │   └── predictApi.js
│   │   │   ├── user/
│   │   │   │   └── userApi.js
│   │   │   ├── apiClient.js        # Konfigurasi instance Axios
│   │   │   └── index.js            # Export API service secara terpusat
│   │   └── utils/                  # Fungsi bantu (formatter, validator, helper)
│   │       ├── form-validators.js
│   │       ├── formatters.jsx
│   │       └── index.js
│   │
│   ├── pages/                      # Halaman utama (berbasis route)
│   │   ├── about-us/
│   │   │   └── AboutUs.jsx
│   │   ├── analisis/
│   │   │   ├── AnalysisPage.jsx
│   │   │   ├── WorkGuideSection/
│   │   │   │   └── WorkGuideSection.jsx
│   │   │   └── AnalysisFormSection/
│   │   │       ├── constants/
│   │   │       │   └── chartConstants.js
│   │   │       ├── views/
│   │   │       │   ├── components/
│   │   │       │   ├── AnalysisLegend.jsx
│   │   │       │   ├── AnalysisResultHeader.jsx
│   │   │       │   ├── AnalysisSubmitForm.jsx
│   │   │       │   ├── AnalysisSummary.jsx
│   │   │       │   ├── AnalysisTooltip.jsx
│   │   │       │   ├── CommentList.jsx
│   │   │       │   └── StatBox.jsx
│   │   │       └── AnalysisFormSection.jsx
│   │   ├── auth/                   # Halaman otentikasi
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── OtpPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   ├── home/
│   │   │   └── HomePage.jsx
│   │   ├── profile/                # Halaman & form profil user
│   │   │   ├── ChangePasswordForm.jsx
│   │   │   ├── EditProfilePage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── status/                 # Halaman status/error
│   │   │   ├── Error.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── NotLogin.jsx
│   │   └── otp/                    # (opsional, jika halaman OTP terpisah)
│   │       └── OtpPage.jsx
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
