# Judi Guard – Backend 🛡️

Backend Judi Guard adalah **server-side service** yang bertanggung jawab atas autentikasi pengguna, integrasi API eksternal, pemrosesan analisis komentar spam judi, serta manajemen data dan moderasi.

Dokumentasi ini berfokus **khusus pada aspek teknis backend**.

---

## 🛠️ Teknologi yang Digunakan

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT & Google OAuth
- **External API:** YouTube Data API v3
- **HTTP Client:** Axios
- **Email Service:** Mailgun
- **Development Tool:** Nodemon
- **Package Manager:** npm

---

## 🚀 Panduan Memulai

### 1. Prasyarat

- Node.js ≥ 18.x
- MongoDB (local / cloud)
- Akun Google Developer (YouTube API)

Pastikan berada di direktori backend:

```bash
cd backend
```

---

### 2. Instalasi Dependensi

```bash
   npm install
```

---

### 3. Konfigurasi Environment Variables

Buat file .env di direktori backend:

```bash
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<dbname>

JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

YOUTUBE_API_KEY=xxxxx

MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=mg.yourdomain.com
```

## ⚠️ Jangan commit file .env ke repository.

## ▶️ Menjalankan Server

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

Server berjalan di:

```bash
http://localhost:3001
```

## 🌐 API Endpoint (Ringkas)

| Method | Endpoint                      | Deskripsi         | Auth |
| :----- | :---------------------------- | ----------------- | ---- |
| POST   | /api/auth/register            | Registrasi user   | ❌   |
| POST   | /api/auth/login               | Login & JWT       | ❌   |
| GET    | /api/users/me                 | Profil user       | ✅   |
| GET    | /api/videos/:videoId/comments | Ambil komentar    | ✅   |
| POST   | /api/analysis/comments        | Analisis komentar | ✅   |
| POST   | /api/moderation/action        | Moderasi komentar | ✅   |
| GET    | /api/moderation/history       | Riwayat moderasi  | ✅   |

---

## 📂 Struktur Folder

```bash
backend/
├── docs/
├── src/
│ ├── api/
│ │ ├── controllers/
│ │ ├── services/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── middlewares/
│ │ └── validators/
│ ├── config/
│ ├── core/
│ ├── utils/
│ ├── app.js
│ └── server.js
├── .env.example
├── package.json
└── README.md
```

📌 Catatan

Backend tidak menjalankan BDD testing secara langsung

Pengujian perilaku sistem dilakukan secara end-to-end menggunakan Cypress di root repository

## 📄 Lisensi

MIT License

---
