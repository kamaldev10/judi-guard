# YouTube Data API v3 – Dokumentasi Lengkap Fitur Komentar

> Fokus: **pengelolaan komentar (list, reply, moderasi, hapus, deteksi konten judi)** untuk sistem **AI + Backend + Frontend**.

---

## 1. Gambaran Umum

YouTube Data API v3 menyediakan resource **`commentThreads`** dan **`comments`** untuk mengakses dan mengelola komentar pada video YouTube.

Komentar dibagi menjadi:

- **Top-level comment** (komentar utama)
- **Reply** (balasan terhadap komentar utama)

API ini mendukung:

- Membaca semua komentar
- Moderasi komentar (approve, reject, spam)
- Menghapus komentar
- Membalas komentar

⚠️ **Catatan penting**:

- Aksi **moderasi & hapus** memerlukan **OAuth 2.0 (akun channel owner / moderator)**
- API Key **tidak cukup** untuk operasi tulis

---

## 2. Resource Utama

### 2.1 `commentThreads`

Digunakan untuk:

- Mengambil komentar utama + reply
- Entry point utama untuk membaca komentar video

Struktur:

```
commentThreads
 └─ snippet
     ├─ topLevelComment
     ├─ totalReplyCount
     └─ videoId
```

### 2.2 `comments`

Digunakan untuk:

- Mengelola **1 komentar spesifik**
- Reply, update, delete, moderation

---

## 3. Autentikasi & Otorisasi

### 3.1 Mode Akses

| Mode      | Bisa Baca | Bisa Moderasi | Bisa Hapus |
| --------- | --------- | ------------- | ---------- |
| API Key   | ✅        | ❌            | ❌         |
| OAuth 2.0 | ✅        | ✅            | ✅         |

### 3.2 OAuth Scope (WAJIB)

Gunakan salah satu:

```
https://www.googleapis.com/auth/youtube.force-ssl
```

Atau (lebih terbatas):

```
https://www.googleapis.com/auth/youtube
```

---

## 4. Mengambil Semua Komentar Video

### Endpoint

```
GET https://www.googleapis.com/youtube/v3/commentThreads
```

### Parameter Wajib

| Parameter | Keterangan                       |
| --------- | -------------------------------- |
| part      | `snippet` atau `snippet,replies` |
| videoId   | ID video                         |

### Parameter Opsional Penting

| Parameter        | Fungsi                                     |
| ---------------- | ------------------------------------------ |
| maxResults       | 1–100                                      |
| pageToken        | pagination                                 |
| order            | `time` / `relevance`                       |
| moderationStatus | `published`, `heldForReview`, `likelySpam` |
| textFormat       | `plainText` / `html`                       |

### Contoh Request

```
GET /commentThreads?part=snippet,replies&videoId=VIDEO_ID&maxResults=100
```

---

## 5. Struktur Response Komentar

### Top-Level Comment

```
snippet.topLevelComment.snippet
```

Field penting:

| Field             | Keterangan      |
| ----------------- | --------------- |
| id                | ID komentar     |
| textDisplay       | Isi komentar    |
| authorDisplayName | Nama user       |
| authorChannelId   | Channel ID user |
| likeCount         | Jumlah like     |
| publishedAt       | Waktu dibuat    |
| moderationStatus  | Status moderasi |

### Reply Komentar

```
replies.comments[]
```

Struktur sama seperti komentar utama.

---

## 6. Mengambil SEMUA Komentar (Termasuk Spam & Review)

Gunakan parameter:

```
moderationStatus=likelySpam
moderationStatus=heldForReview
```

⚠️ **Hanya bisa dengan OAuth & channel owner**

---

## 7. Moderasi Komentar (PENTING UNTUK AI JUDI)

### Endpoint Moderasi

```
POST https://www.googleapis.com/youtube/v3/comments/setModerationStatus
```

### Parameter

| Parameter        | Wajib                                    |
| ---------------- | ---------------------------------------- |
| id               | ID komentar                              |
| moderationStatus | `published`, `heldForReview`, `rejected` |
| banAuthor        | `true` / `false`                         |

### Contoh

```
id=COMMENT_ID
moderationStatus=rejected
banAuthor=false
```

### Status Moderasi

| Status        | Arti               |
| ------------- | ------------------ |
| published     | Ditampilkan publik |
| heldForReview | Ditahan            |
| rejected      | Ditolak / spam     |

---

## 8. Menghapus Komentar (DELETE)

### Endpoint

```
DELETE https://www.googleapis.com/youtube/v3/comments
```

### Parameter

| Parameter | Keterangan  |
| --------- | ----------- |
| id        | ID komentar |

⚠️ Permanen, tidak bisa dikembalikan

---

## 9. Membalas Komentar (Reply)

### Endpoint

```
POST https://www.googleapis.com/youtube/v3/comments
```

### Body

```
snippet.parentId = COMMENT_ID
snippet.textOriginal = "Isi balasan"
```

---

## 10. Update Isi Komentar

⚠️ **Hanya komentar milik channel sendiri**

```
PUT https://www.googleapis.com/youtube/v3/comments
```

---

## 11. Batasan & Quota

| Operasi             | Quota Cost |
| ------------------- | ---------- |
| list commentThreads | 1 unit     |
| delete comment      | 50 unit    |
| setModerationStatus | 50 unit    |
| insert reply        | 50 unit    |

Default quota: **10.000 unit / hari**

---

## 12. Arsitektur Sistem AI Deteksi Judi (REKOMENDASI)

### Alur Ideal

1. **Fetch komentar** (backend cron / webhook)
2. **Normalize text** (lowercase, remove emoji, url decode)
3. **AI Classification**
   - Judi
   - Non-judi

4. **Decision Engine**
   - Judi → `rejected`
   - Non-judi → `published`

5. **YouTube API Action**
   - `setModerationStatus`
   - `delete` (opsional)

---

## 13. Data Penting untuk Model AI

Field yang sebaiknya dikirim ke AI:

```
{
  commentId,
  textOriginal,
  authorChannelId,
  publishedAt,
  likeCount,
  replyCount
}
```

---

## 14. Edge Case yang HARUS Ditangani

- Komentar di-disable oleh owner
- Live chat ≠ comment API
- Shadow-ban (komentar hilang tanpa status)
- Rate limit burst

---

## 15. Praktik Keamanan

- Simpan OAuth token di backend
- Jangan expose token ke frontend
- Gunakan refresh token rotation
- Logging semua aksi moderasi

---

## 16. Kesimpulan

YouTube Data API v3 **cukup lengkap** untuk:

- Moderasi otomatis
- Integrasi AI content detection
- Sistem manajemen komentar skala besar

Namun:

- **Wajib OAuth**
- **Quota mahal untuk write operation**

---
