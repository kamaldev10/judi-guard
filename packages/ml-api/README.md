---
title: Judi Guard - Flask ML API
emoji: 🛡️
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# Judi Guard - Flask ML API

Layanan ini adalah sebuah aplikasi web berbasis Flask yang berfungsi untuk menyajikan model Machine Learning klasifikasi teks. Tujuan utamanya adalah untuk menganalisis sebuah teks (seperti komentar YouTube) dan menentukan apakah teks tersebut mengandung konten terkait perjudian ("Judi") atau tidak ("Non-Judi").

---

## Aplikasi ini menyediakan dua jenis antarmuka:

1. Antarmuka Web Sederhana: Sebuah halaman HTML untuk pengujian dan demonstrasi secara manual.
2. JSON API: Endpoint khusus yang menerima dan mengembalikan data dalam format JSON, dirancang untuk dikonsumsi oleh layanan backend lain (seperti backend Express.js), baik untuk satu komentar maupun analisis massal (batch).

---

## Teknologi yang Digunakan

1. Python 3.11
2. Flask: Framework web untuk membangun aplikasi.
3. TensorFlow (CPU): Untuk menjalankan model klasifikasi.
4. Hugging Face Transformers: Untuk memuat model `TFDistilBertForSequenceClassification` dan `DistilBertTokenizerFast`.

---

## Struktur Folder

```bash
ml-api/
├── .venv/                  # Direktori virtual environment Python (lokal saja)
├── saved_model/            # Direktori berisi model & tokenizer yang sudah di-train
├── templates/
│   └── index.html          # Template HTML untuk antarmuka web
├── app.py                  # Logika utama aplikasi Flask
├── Dockerfile              # Definisi image untuk deployment (Hugging Face Spaces)
├── requirements.txt        # Daftar dependensi Python
└── README.md               # Dokumentasi ini
```

## Instalasi dan Setup Lokal

Ikuti langkah-langkah ini untuk menjalankan layanan API secara lokal di mesin Anda.

### 1. Prasyarat

Pastikan Anda sudah menginstal Python 3.11 atau versi yang lebih baru.

### 2. Masuk ke direktori proyek

```bash
cd path/to/your/ml-api
```

### 3. `requirements.txt`

File ini sudah tersedia di proyek dan berisi:

```
flask
transformers==4.41.2
tensorflow-cpu==2.15.0
python-dotenv
gunicorn
```

### 4. Buat dan Aktifkan Virtual Environment

Sangat disarankan untuk menggunakan lingkungan virtual agar dependensi proyek terisolasi.

```bash
# Buat virtual environment
python -m venv .venv

# Aktifkan di Windows (PowerShell)
.\.venv\Scripts\Activate.ps1

# Aktifkan di Linux/macOS
source .venv/bin/activate
```

Anda akan melihat `(.venv)` muncul di awal prompt terminal Anda.

### 5. Instal Dependensi

```bash
pip install -r requirements.txt
```

---

## Cara Menjalankan Aplikasi

### Secara lokal (langsung dengan Python)

```bash
python app.py
```

Anda akan melihat output di terminal yang menandakan model sedang dimuat, diikuti pesan bahwa server berjalan:

```
- Serving Flask app 'app'
- Running on http://0.0.0.0:7860
```

> Port default aplikasi ini adalah **7860** (mengikuti standar Hugging Face Spaces). Bisa diubah lewat environment variable `PORT` jika dijalankan di lingkungan lain.

### Dengan Docker (sama seperti environment Hugging Face Spaces)

```bash
docker build -t judi-guard .
docker run -p 7860:7860 judi-guard
```

Server API ML Anda sekarang aktif dan siap menerima permintaan di `http://localhost:7860`.

---

## Cara Penggunaan

Aplikasi ini bisa digunakan melalui tiga cara:

### 1. Antarmuka Web (untuk Demo)

- Buka browser web Anda dan kunjungi `http://localhost:7860`.
- Anda akan melihat halaman pemindai komentar dengan area teks.
- Masukkan komentar yang ingin diuji, lalu klik tombol "Pindai Komentar".
- Hasil klasifikasi dan tingkat keyakinan akan ditampilkan di bawah formulir.

### 2. JSON API — Prediksi Tunggal (untuk Backend)

Endpoint ini dipanggil oleh backend Express.js (atau layanan lain) untuk memeriksa satu komentar.

**Endpoint:** `POST /api/predict`
**Deskripsi:** Menerima objek JSON dengan key `text` dan mengembalikan hasil klasifikasi dalam format JSON.

**Request Body (JSON):**

```json
{
  "text": "situs gacor maxwin hari ini bosku"
}
```

**Success Response (200 OK):**

```json
{
  "classification": "JUDI",
  "confidenceScore": 0.9987
}
```

**Error Response (400 Bad Request):** Jika key `text` tidak ditemukan dalam request body.

```json
{
  "error": "Input JSON harus berisi key 'text'"
}
```

### 3. JSON API — Analisis Massal (Batch)

Endpoint ini dirancang untuk memeriksa banyak komentar sekaligus, misalnya hasil scraping dari MongoDB.

**Endpoint:** `POST /api/analyze`
**Deskripsi:** Menerima array `comments`, masing-masing dengan `id` dan `text`, lalu mengembalikan hasil klasifikasi untuk setiap komentar.

**Request Body (JSON):**

```json
{
  "comments": [
    { "id": "mongo_id_1", "text": "situs gacor maxwin hari ini bosku" },
    { "id": "mongo_id_2", "text": "videonya keren banget kak" }
  ]
}
```

**Success Response (200 OK):**

```json
{
  "status": "success",
  "total_processed": 2,
  "results": [
    { "id": "mongo_id_1", "classification": "JUDI", "confidenceScore": 0.9987 },
    {
      "id": "mongo_id_2",
      "classification": "NON_JUDI",
      "confidenceScore": 0.9812
    }
  ]
}
```

**Error Response (400 Bad Request):** Jika key `comments` tidak ada atau bukan berupa array.

```json
{
  "status": "error",
  "message": "Input harus memiliki array 'comments'"
}
```

---

## Deployment ke Hugging Face Spaces

Proyek ini sudah dikonfigurasi untuk dideploy sebagai **Docker Space** di Hugging Face:

1. Buat Space baru dengan SDK **Docker**.
2. Push seluruh isi folder ini (termasuk `saved_model/` via Git LFS) ke repo Space.
3. Blok metadata di bagian paling atas file ini (`sdk: docker`, `app_port: 7860`) akan dibaca otomatis oleh Hugging Face untuk mem-build dan menjalankan Space.
