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

- Pastikan Anda sudah berada di dalam direktori `frontend`. Jika belum, navigasi dari root proyek: `cd frontend`.
- Node.js dan npm sudah terinstal.

### 2. Instalasi Dependensi

```sh
npm install
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

Berikut adalah gambaran umum struktur folder di dalam `src/`:

```
public/ logo.png
src/
    ├── assets/         # File statis seperti gambar, ikon, dll.
        ├── icons /
        └── images /
    ├── components/     # Komponen React yang dapat digunakan kembali (Loader, Layout, Tagline)
        ├── auth / GoogleSignInButton.jsx
        ├── layout / Footer.jsx, Header.jsx, MainLayout.jsx
        ├── loader / Loader.jsx
        ├── tagline / Tagline.jsx
        └── text-predict / TextPredictForm.jsx
    ├── constants/      # data statis
    ├── context/        # Konteks React untuk state management global (e.g., AuthContext)
        └── AuthContext.jsx
    ├── hooks/          # Custom hooks (e.g., usePofile, useVideoAnalysis)
        ├── profile / useEditProfilePresenter.js , useProfilePresenter.js
        ├── text-predict / useTextPredict.js
        └── video-analysis / useVideoAnalysis.js
    ├── pages/          # Komponen yang mewakili halaman (Login, Register, HomePage, Analysis)
        ├── about-us / AboutUs.jsx, index.js
        ├── analisis /
            └── AnalysisFormSection /
                ├── constants/ chartConstants.js
                └── views /
                    ├── components /
                    |   ├── AnalysisLegend.jsx
                    |   ├── AnalysisResultHeader.jsx
                    |   ├── AnalysisSubmitForm.jsx
                    |   ├── AnalysisSUmmary.jsx
                    |   ├── AnalysisTooltip.jsx
                    |   ├── CommentList.jsx
                    |   └── StatBox.jsx
                    └── AnalysisFormSection.jsx
            ├── WorkGuideSection / WorkGuideSection.jsx
            └── AnalysisPage.jsx
        ├── auth
            ├── login / Login.jsx
            ├── register / Register.jsx
            ├── ForgotPasswordPage.jsx
            └── ResetPasswordPage.jsx
        ├── home
            ├── ConnectSection.jsx
            ├── ContactSection.jsx
            ├── HeroSection.jsx
            ├── HomePage.jsx
            ├── TestimonialsSection.jsx
            └── TextPredictSection.jsx
        ├── otp / OtpPage.jsx
        ├── profile / ChangePasswordForm.jsx, EditProfilePage.jsx, ProfilePage.jsx
        └── status / Error.jsx, NotFound.jsx, NotLogin.jsx
    ├── routes/         # router untuk navigasi halaman aplikasi
        ├── AppRouter.jsx
        └── ProtectedRoute.jsx
    ├── services/       # Fungsi untuk berinteraksi dengan API backend (api.js)
        └── api.js
    ├── utils/          # Fungsi utilitas umum
        ├── formatters.jsx
        └── FormValidator.js
    ├── App.jsx         # Komponen root aplikasi
    ├── main.jsx        # Titik masuk aplikasi
    └── style.css       # styling global aplikasi
.env.example
.gitignore
index.html
package-lock.json
package.json
README.md
tailwind.config.js
vite.config.js
```

Struktur ini dirancang untuk menjaga kode tetap terorganisir dan mudah untuk dikelola seiring dengan pertumbuhan aplikasi.
