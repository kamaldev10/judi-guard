# Judi Guard (v1) 🛡️

<p align="left">Say Goodbye to Spam Judi with Judi Guard.</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/162c46d0-584a-40ce-bfab-5f4290028cb9" alt="Judi Guard Logo" />
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=black)](https://www.javascript.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey?logo=express)](https://expressjs.com/)

---

## 📌 Tentang Judi Guard

**Judi Guard** adalah aplikasi web berbasis AI yang dirancang untuk membantu kreator konten dan pengelola channel YouTube dalam **mendeteksi, menganalisis, dan memoderasi komentar spam judi online** secara lebih efektif.

Aplikasi ini dikembangkan berdasarkan **Product Requirements Document (PRD)** dan hasil penelitian skripsi dengan pendekatan **Behaviour Driven Development (BDD)**, sehingga pengembangan sistem berfokus pada perilaku dan kebutuhan pengguna nyata.

---

## ✨ Fitur Utama

- 🕵️ **Deteksi Komentar Spam Judi Otomatis**
- 📊 **Skor Kepercayaan & Tingkat Risiko Komentar**
- 🧠 **Alasan / Indikator Deteksi yang Transparan**
- 🛠️ **Moderasi Komentar (Individual & Massal)**
- 📋 **Riwayat & Laporan Moderasi**
- ⚙️ **Whitelist Akun & Blacklist Kata/Pola**
- 🔐 **RBAC + Workspace Multi-Tenant**
- 🔗 **Integrasi YouTube Data API v3**

---

## 🧪 Behaviour Driven Development (BDD)

Pengembangan Judi Guard menggunakan pendekatan **Behaviour Driven Development (BDD)** untuk memastikan bahwa sistem yang dibangun benar-benar sesuai dengan kebutuhan pengguna.

### Peran BDD dalam Proyek Ini

- User stories dan skenario Gherkin disusun berdasarkan PRD
- Perilaku sistem menjadi fokus utama pengembangan
- Pengujian dilakukan berdasarkan **perilaku**, bukan sekadar fungsi teknis

### Automated Testing (End-to-End)

- **Tool:** Cypress
- **Lokasi:** Root repository (`/cypress`)
- **Waktu eksekusi:** Setelah seluruh fitur utama terimplementasi
- **Cakupan:** End-to-End (Frontend + Backend)

Pendekatan ini memungkinkan pengujian bertindak sebagai **Automated User Acceptance Testing (UAT)** yang merepresentasikan perilaku pengguna nyata.

---

## 🛠️ Arsitektur & Teknologi

Proyek ini menggunakan **monorepo** (npm workspaces), dengan pemisahan jelas antara frontend, backend, dan testing.

| Layer         | Teknologi                                   |
| ------------- | ------------------------------------------- |
| Frontend      | React + Vite, Tailwind CSS                  |
| Backend       | Node.js, Express 5 (ESM), MongoDB           |
| AI / Analisis | ML API (Python, Hugging Face Spaces)        |
| RBAC          | Role-based + Workspace multi-tenant         |
| Testing       | Cypress (BDD – E2E)                         |
| External API  | YouTube Data API v3                         |
| API Docs      | Swagger (swagger-jsdoc, swagger-ui-express) |

---

## 📁 Struktur Proyek

```bash
judi-guard/
├── .vscode
├── packages/
|   ├── backend/        # Backend service (Express + MongoDB)
|   ├── frontend/       # Frontend app (React)
|   └── ml-api/         # Model AI
├── cypress/            # BDD End-to-End Testing
├── cypress.config.js
├── LICENSE
└── README.md           # Dokumentasi utama (file ini)
```

---

## 🚀 Menjalankan Proyek (Development)

### Prasyarat

```bash
Node.js ≥ 20.x

npm

Git
```

---

### Setup Backend

```bash
cd packages/backend
npm install
npm run dev       # port 3001
```

### Setup Frontend

```bash
cd packages/frontend
npm install
npm run dev       # port 5173
```

### Dokumentasi API (Swagger)

Jika backend berjalan, buka:

```
http://localhost:3001/api-docs
```

## 🤝 Kontribusi

Kontribusi sangat terbuka untuk pengembangan lebih lanjut.
Silakan fork repository ini dan ajukan pull request.

## 📄 Lisensi

Project ini menggunakan MIT License.

<p align="center"> Dibuat dengan ❤️ oleh Kamaldev10 </p>
