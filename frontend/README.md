# Judi Guard - Frontend 🛡️ (Client-Side)

Selamat datang di direktori frontend untuk proyek Judi Guard. Bagian ini dibangun menggunakan React (dengan Vite) dan bertanggung jawab untuk menyediakan antarmuka pengguna (UI) yang interaktif dan responsif bagi pengguna untuk berinteraksi dengan layanan Judi Guard.

---

## 🛠️ Teknologi & Library Utama

-   **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Routing:** [React Router DOM](https.com/package/react-router-dom)
-   **HTTP Client:** [Axios](https://axios-http.com/)
-   **Linting:** [ESLint](https://eslint.org/)
-   **Package Manager:** [npm](https://www.npmjs.com/)

---

## 🚀 Panduan Memulai

### 1. Prasyarat

-   Pastikan Anda sudah berada di dalam direktori `frontend`. Jika belum, navigasi dari root proyek: `cd frontend`.
-   Node.js dan npm sudah terinstal.

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
public/
src/
├── assets/         # File statis seperti gambar, ikon, dll.
├── components/     # Komponen React yang dapat digunakan kembali (Loader, Layout, Tagline)
├── context/        # Konteks React untuk state management global (e.g., AuthContext)
├── hooks/          # Custom hooks (e.g., usePofile, useVideoAnalysis)
├── pages/          # Komponen yang mewakili halaman (Login, Register, HomePage, Analysis)
├── routes/         # router untuk navigasi halaman aplikasi 
├── services/       # Fungsi untuk berinteraksi dengan API backend (api.js)
├── utils/          # Fungsi utilitas umum
├── App.jsx         # Komponen root aplikasi
├── main.jsx        # Titik masuk aplikasi
└── style.css       # styling global aplikasi
```
Struktur ini dirancang untuk menjaga kode tetap terorganisir dan mudah untuk dikelola seiring dengan pertumbuhan aplikasi.
