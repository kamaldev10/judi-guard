# Judi Guard - Backend 🛡️ (Server-Side)

Selamat datang di direktori backend untuk proyek Judi Guard. Bagian ini bertanggung jawab atas semua logika sisi server, termasuk otentikasi pengguna, interaksi dengan database, integrasi dengan API eksternal, dan inti dari analisis komentar AI.

---

## 🛠️ Teknologi yang Digunakan

-   **Framework:** [Express.js](https://expressjs.com/)
-   **Database:** [MongoDB](https://www.mongodb.com/) dengan ODM [Mongoose](https://mongoosejs.com/)
-   **Authentication:** JSON Web Tokens (JWT) & Google OAuth
-   **API Integration:** [Axios](https://axios-http.com/), [YouTube Data API v3](https://developers.google.com/youtube/v3)
-   **Email Service:** [Mailgun](https://www.mailgun.com/)
-   **Development:** [Nodemon](https://nodemon.io/) untuk hot-reloading
-   **Package Manager:** [npm](https://www.npmjs.com/)

---

## 🚀 Panduan Memulai

### 1. Prasyarat

-   Pastikan Anda sudah berada di dalam direktori `backend`. Jika belum, navigasi dari root proyek: `cd backend`.
-   Node.js dan npm sudah terinstal.

### 2. Instalasi Dependensi

```sh
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di dalam direktori `backend`. Salin konten dari `.env.example` (jika ada) atau gunakan templat di bawah ini dan isi dengan kredensial Anda.

```ini
# .env file

# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=rahasia_super_aman_untuk_jwt

# Google OAuth Credentials
GOOGLE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxx

# YouTube Data API
YOUTUBE_API_KEY=xxxxxxxxxxxx

# Mailgun API
MAILGUN_API_KEY=key-xxxxxxxxxxxx
MAILGUN_DOMAIN=mg.domainanda.com
```

**Penting:** Jangan pernah membagikan file `.env` Anda atau mengunggahnya ke repositori publik.

---

## ▶️ Menjalankan Server

-   **Untuk Development (dengan auto-restart):**
    Server akan otomatis me-restart setiap kali ada perubahan file.
    ```sh
    npm run dev
    ```

-   **Untuk Produksi:**
    ```sh
    npm start
    ```
    Server akan berjalan di `http://localhost:5000` (atau port yang Anda tentukan).

## 🧪 Menjalankan Tes

Untuk menjalankan rangkaian pengujian (jika dikonfigurasi):
```sh
npm run test
```

---

## 🌐 Endpoint API

Berikut adalah beberapa contoh endpoint API utama yang tersedia:

| Method  | Endpoint                                                 | Deskripsi                                       | Memerlukan Auth |
| :-----  | :------------------------------------------------------- | :---------------------------------------------- | :-------------- |
| `POST`  | `/api/v1/auth/register`                                  | Mendaftarkan pengguna baru.                     | Tidak           |
| `POST`  | `/api/v1/auth/login`                                     | Login pengguna dan mendapatkan token JWT.       | Tidak           |
| `GET`   | `/api/v1/youtube/connect`                                | Koneksi akun ke platform YouTube.               | Ya              |
| `GET`   | `/api/v1/users/me`                                       | Mendapatkan data pengguna yang sedang login.    | Ya              |
| `POST`  | `/api/v1/analysis/videos`                                | Mengirimkan video untuk dianalisis.             | Ya              |
| `DELETE`| `/api/v1/analysis/videos/:analysisId/judi-comments`      | Mengirimkan video untuk dianalisis.             | Ya              |


Dokumentasi API yang lebih lengkap dapat ditemukan menggunakan tools seperti Postman atau Swagger (jika diimplementasikan).
