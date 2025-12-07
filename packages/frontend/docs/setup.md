Panduan instalasi & konfigurasi

# ⚙️ Setup & Environment Configuration

## 1. Persiapan Lingkungan

Pastikan telah menginstal dependensi berikut:

- Node.js >= 18
- npm atau pnpm
- Git
- Browser modern (Chrome, Edge, Firefox)

Clone repository:

```bash
git clone https://github.com/kamaldev10/judi-guard.git
cd packages/frontend
```

Instal dependensi:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run dev
```

Buka di browser:

```sh
http://localhost:5173
```

---

### 2. File Environment

Buat file .env di root project:

```sh
VITE_API_BASE_URL=https://api.judiguard.com
VITE_GOOGLE_CLIENT_ID=your_google_oauth_id
```

---

### 3. Struktur Build dan Deployment

Build untuk production:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

Hasil build tersimpan di folder /dist.
Deployment dapat dilakukan ke:

Vercel / Netlify (direkomendasikan) atau server statis menggunakan Nginx.
