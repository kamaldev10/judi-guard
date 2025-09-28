# Judi Guard - Flask ML API

Layanan ini adalah sebuah aplikasi web berbasis Flask yang berfungsi untuk menyajikan model Machine Learning klasifikasi teks. Tujuan utamanya adalah untuk menganalisis sebuah teks (seperti komentar YouTube) dan menentukan apakah teks tersebut mengandung konten terkait perjudian ("Judi") atau tidak ("Non-Judi").

---

## Aplikasi ini menyediakan dua jenis antarmuka:

1. Antarmuka Web Sederhana: Sebuah halaman HTML untuk pengujian dan demonstrasi secara manual.
2. JSON API: Sebuah endpoint khusus yang menerima dan mengembalikan data dalam format JSON, dirancang untuk dikonsumsi oleh layanan backend lain (seperti backend Express.js).

---

## Teknologi yang Digunakan

1. Python 3.11
2. Flask: Framework web untuk membangun aplikasi.
3. TensorFlow: Untuk menjalankan model klasifikasi.
4. Hugging Face Transformers: Untuk memuat model TFDistilBertForSequenceClassification dan DistilBertTokenizerFast.

---

## Struktur Folder

```bash
ml-api/
├── .venv/                  # Direktori virtual environment Python
├── saved_model/            # Direktori berisi model & tokenizer yang sudah di-train
├── templates/
│   └── index.html          # Template HTML untuk antarmuka web
├── app.py                  # Logika utama aplikasi Flask
├── requirements.txt        # Daftar dependensi Python
└── README.md               # Dokumentasi ini
```

## Instalasi dan Setup Lokal

Ikuti langkah-langkah ini untuk menjalankan layanan API secara lokal di mesin Anda.

1. Prasyarat

Pastikan Anda sudah menginstal Python 3.11 atau versi yang lebih baru.

2. Siapkan Proyek

Masuk ke direktori ml-api:

```Bash
cd path/to/your/ml-api 3. Buat File requirements.txt
```

3. Buat file baru bernama requirements.txt dan isi dengan daftar library yang dibutuhkan:

```bash
flask
transformers
tensorflow
torch
```

4. Buat dan Aktifkan Virtual Environment
   Sangat disarankan untuk menggunakan lingkungan virtual agar dependensi proyek terisolasi.

```Bash

# Buat virtual environment

python -m venv .venv

# Aktifkan di Windows (PowerShell)

.\.venv\Scripts\activate

# Aktifkan di Linux/macOS

source .venv/bin/activate
```

Anda akan melihat (.venv) muncul di awal prompt terminal Anda.

5. Instal Dependensi
   Instal semua library yang dibutuhkan dari file requirements.txt.

```Bash

pip install -r requirements.txt
```

## Cara Menjalankan Aplikasi

Setelah semua dependensi terinstal dan virtual environment aktif, jalankan server Flask dengan perintah berikut:

```Bash

python app.py
```

Anda akan melihat output di terminal yang menandakan model sedang dimuat, diikuti dengan pesan bahwa server berjalan, seperti:

```Bash
- Serving Flask app 'app'
- Running on http://0.0.0.0:5000
```

Server API ML Anda sekarang aktif dan siap menerima permintaan.

## Cara Penggunaan

Aplikasi ini bisa digunakan melalui dua cara:

1. Antarmuka Web (untuk Demo)
   - Buka browser web Anda dan kunjungi http://localhost:5000.
   - Anda akan melihat sebuah halaman dengan area teks.
   - Masukkan komentar yang ingin diuji, lalu klik tombol "Prediksi".
   - Hasil prediksi akan ditampilkan di bawah formulir.
2. JSON API (untuk Backend)
   Ini adalah endpoint yang akan dipanggil oleh backend Express.js Anda.

Endpoint: ` bash POST /api/predict`
Deskripsi: Menerima sebuah objek JSON dengan key text dan mengembalikan hasil klasifikasi dalam format JSON.
Request Body (JSON):

```JSON

{
"text": "situs gacor maxwin hari ini bosku"
}
```

Success Response (200 OK):

```JSON

{
"classification": "JUDI",
"confidenceScore": 0.9987
}
```

Error Response (400 Bad Request): Jika key text tidak ditemukan dalam request body.

```JSON

{
"error": "Input JSON harus berisi key 'text'"
}
```


