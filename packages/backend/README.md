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

- Node.js ≥ 20.x
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

---

## 📂 Struktur Folder

```bash
backend/
├── src
│   ├── app
│   │   ├── api.routes.js
│   │   ├── app.js
│   │   └── server.js
│   ├── config
│   │   ├── database.js
│   │   └── environment.js
│   ├── middlewares
│   │   ├── ensure-youtube-access.js
│   │   ├── error-handler.js
│   │   ├── is-authenticated.js
│   │   └── validate-request.js
│   ├── modules
│   │   ├── auth
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validator.js
│   │   │   └── password-reset.model.js
│   │   ├── channel
│   │   │   ├── channel.controller.js
│   │   │   ├── channel.routes.js
│   │   │   ├── channel.service.js
│   │   │   └── channel.validator.js
│   │   ├── configuration
│   │   │   ├── configuration.controller.js
│   │   │   ├── configuration.model.js
│   │   │   ├── configuration.routes.js
│   │   │   └── configuration.service.js
│   │   ├── studio
│   │   │   ├── studio.controller.js
│   │   │   ├── studio.routes.js
│   │   │   └── studio.service.js
│   │   ├── text-predict
│   │   │   ├── textPredict.controller.js
│   │   │   └── textPredict.routes.js
│   │   ├── user
│   │   │   ├── user.controller.js
│   │   │   ├── user.model.js
│   │   │   ├── user.routes.js
│   │   │   └── user.service.js
│   │   └── video-analysis
│   │       ├── video-analysis.model.js
│   │       ├── videoAnalysis.controller.js
│   │       ├── videoAnalysis.routes.js
│   │       └── videoAnalysis.service.js
│   └── shared
│       ├── clients
│       │   └── ml-api.client.js
│       ├── constants
│       │   └── gambling-keywords.js
│       ├── services
│       │   ├── ai.service.js
│       │   └── youtube.service.js
│       └── utils
│           ├── commentProcessor.js
│           ├── emailSender.js
│           ├── errors.js
│           ├── googleOAuth2Client.js
│           ├── jwt.js
│           ├── pdf-generator.js
│           └── youtubeHelper.js
├── test
│   ├── comment-deletion.test.js
│   └── setup.js
├── Dockerfile
├── eslint.config.mjs
├── jest.setup.js
├── jsconfig.json
├── package-lock.json
├── package.json
└── README.md
```

📌 Catatan

Backend tidak menjalankan BDD testing secara langsung

Pengujian perilaku sistem dilakukan secara end-to-end menggunakan Cypress di root repository

## 📄 Lisensi

MIT License

---
