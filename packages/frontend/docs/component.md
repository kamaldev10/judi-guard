# 🎨 Dokumentasi UI Components

Aplikasi menggunakan **shadcn/ui** + **TailwindCSS** untuk antarmuka yang konsisten dan modern.

## 1. Prinsip Desain

- Gunakan skema warna abu-abu netral.
- Komponen harus reusable dan modular.
- Gunakan animasi halus dari Framer Motion bila perlu.

---

## 2. Contoh Komponen: Card Cerita

```jsx
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function StoryCard({ story }) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent>
        <img src={story.photoUrl} className="rounded-full w-24 h-24" />
        <CardTitle>{story.name}</CardTitle>
      </CardContent>
    </Card>
  );
}
```

---

### Pola "Container/Presentational Components" (atau "Komponen Pintar vs Bodoh"):

Container Component (Pintar): Komponen yang Anda miliki sekarang (TextPredictForm) akan menjadi Container. Tugasnya adalah mengelola state (termasuk koneksi ke store Zustand) dan menangani logika (handleSubmit), tetapi tidak me-render banyak UI.

Presentational Components (Bodoh): Komponen baru yang akan Anda buat (TextPredictInput dan TextPredictResultsArea). Tugas mereka hanya me-render UI berdasarkan props yang mereka terima. Mereka tidak tahu-menahu soal store atau state.
