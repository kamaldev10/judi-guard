# Judi Guard (v1)🛡 


*<p align="center">![LogoWithSloganBgBlack](https://github.com/user-attachments/assets/162c46d0-584a-40ce-bfab-5f4290028cb9) </p>*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript&logoColor=black)](https://www.javascript.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey?logo=express)](https://expressjs.com/)

Judi Guard adalah aplikasi web berbasis AI yang dirancang untuk mendeteksi dan menganalisis komentar yang mengandung unsur judi online pada platform seperti YouTube. Dengan teknologi cerdas, Judi Guard memberikan solusi cepat, akurat, dan efisien untuk membantu kreator konten dan manajer komunitas menjaga ruang interaksi mereka tetap bersih dan aman dari konten berbahaya.


---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Panduan Memulai](#-panduan-memulai)
- [Instalasi](#-instalasi)
- [Menjalankan Proyek](#-menjalankan-proyek)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

-   **🕵️ Analisis Komentar Berbasis AI:** Menggunakan model machine learning untuk mengidentifikasi pola dan kata kunci terkait judi online dengan akurasi tinggi.
-   **🔗 Integrasi YouTube API:** Terhubung langsung dengan YouTube Data API v3 untuk mengambil data komentar dari video secara *real-time*.
-   **👤 Otentikasi Pengguna Aman:** Sistem login dan registrasi menggunakan OAuth untuk memastikan keamanan data pengguna.
-   **📊 Dashboard Interaktif:** Antarmuka yang ramah pengguna untuk memvisualisasikan hasil analisis, melacak komentar, dan mengelola video yang dipantau.
-   **⚙️ Penanganan Error:** Dirancang dengan sistem penanganan error yang tangguh untuk memastikan pengalaman pengguna yang mulus.

---

## 🛠️ Arsitektur & Teknologi

Proyek ini menggunakan arsitektur *monorepo* yang terpisah antara backend dan frontend untuk skalabilitas dan pemeliharaan yang lebih baik.

| Bagian    | Teknologi                                                                                              |
| :-------- | :----------------------------------------------------------------------------------------------------- |
| **Backend** | Node.js, Express, MongoDB (dengan Mongoose), JSON Web Tokens (JWT), YouTube Data API v3, Mailgun, Axios |
| **Frontend**| React (dengan Vite), React Router, Tailwind CSS, Axios, ESLint                                           |
| **Tools** | Git, NPM, Nodemon, Markdown                                                                            |

---

## 📁 Struktur Proyek

```
judi-guard-app/
├── backend/
│   ├── ... (File-file backend)
│   └── README.md  (Panduan khusus backend)
├── frontend/
│   ├── ... (File-file frontend)
│   └── README.md  (Panduan khusus frontend)
├── .gitignore
└── README.md      (Anda sedang melihat file ini)
```

---

## 🚀 Panduan Memulai

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah di bawah ini.

### Prasyarat

-   [Node.js](https://nodejs.org/en/) (v18 atau lebih tinggi direkomendasikan)
-   [npm](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)
-   [Git](https://git-scm.com/)

---

## ⚙️ Instalasi

1.  **Clone repositori ini:**
    ```sh
    git clone [https://github.com/kamaldev10/judi-guard-app.git](https://github.com/kamaldev10/judi-guard-app.git)
    ```

2.  **Masuk ke direktori proyek:**
    ```sh
    cd judi-guard-app
    ```

3.  **Setup Backend:**
    -   Masuk ke direktori backend, instal dependensi, dan konfigurasikan environment variables.
    -   Untuk instruksi lebih detail, lihat file `backend/README.md`.
    ```sh
    cd backend
    npm install
    ```

4.  **Setup Frontend:**
    -   Kembali ke direktori utama, lalu masuk ke direktori frontend, instal dependensi, dan konfigurasikan environment variables.
    -   Untuk instruksi lebih detail, lihat file `frontend/README.md`.
    ```sh
    cd ../frontend
    npm install
    ```

---

## ▶️ Menjalankan Proyek

Anda perlu menjalankan **dua terminal terpisah** secara bersamaan: satu untuk backend dan satu untuk frontend.

1.  **Terminal 1: Jalankan Server Backend**
    ```sh
    # Dari direktori judi-guard-app/backend
    npm run dev
    ```
    Server backend akan berjalan di `http://localhost:5000` (atau port yang Anda tentukan di `.env`).

2.  **Terminal 2: Jalankan Aplikasi Frontend**
    ```sh
    # Dari direktori judi-guard-app/frontend
    npm run dev
    ```
    Aplikasi React akan berjalan di `http://localhost:5173` (atau port lain yang tersedia).

---

## 🤝 Kontribusi

Kontribusi Anda sangat kami hargai! Jika Anda ingin berkontribusi, silakan lakukan *fork* pada repositori ini dan buat *pull request* dengan perubahan yang Anda usulkan.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.

---
<p align="center">Membantu Anda Menjaga Ruang Digital Tetap Aman.</p>
<p align="center">Dibuat dengan ❤️ oleh Kamaldev10 and team</p>
