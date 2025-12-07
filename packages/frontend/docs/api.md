## 🔗 `docs/api.md`

# 🔗 Dokumentasi API Service

Aplikasi berkomunikasi dengan backend melalui REST API (JudiGuard API v1).

## Endpoint

| Endpoint           | Method | Deskripsi                 |
| ------------------ | ------ | ------------------------- |
| `/api/login`       | POST   | Login user                |
| `/api/register`    | POST   | Registrasi akun           |
| `/api/stories`     | GET    | Mendapatkan daftar cerita |
| `/api/stories/:id` | GET    | Detail cerita             |
| `/api/stories`     | POST   | Menambah cerita baru      |

---

## Contoh Pemanggilan API

```js
import { api } from "@/lib/services/api";

export const getStories = async () => {
  const res = await api.get("/stories");
  return res.data;
};
```

`````

Validasi Respons

Semua respons divalidasi menggunakan Zod Schema agar konsisten antara backend dan frontend.

---

## 🧱 `docs/state-management.md`

````md
# 🧱 Manajemen State (Zustand)

## 1. Tujuan

Zustand digunakan untuk menyimpan state global seperti:

- status autentikasi
- profil user
- daftar cerita
- lokasi peta

---

## 2. Contoh Store

```js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
```
`````

3. Prinsip

Sederhana: Tidak memerlukan boilerplate Redux.

Persisten: Dapat disimpan ke localStorage.

Terpisah: Tidak mencampur state UI dan data.

4. Testing Store
   import { useAuthStore } from "@/store/auth";

test("setUser menyimpan data user", () => {
const store = useAuthStore.getState();
store.setUser({ name: "Ali" });
expect(store.user.name).toBe("Ali");
});
