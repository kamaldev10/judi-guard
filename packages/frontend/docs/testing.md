# Strategi Pengujian Aplikasi Judi Guard

Dokumen ini menjelaskan metodologi, arsitektur, dan _tools_ yang digunakan untuk pengujian pada proyek _frontend_ Judi Guard. Tujuan dari strategi ini adalah untuk memastikan kualitas, maintainabilitas, dan keandalan aplikasi melalui pendekatan pengujian yang terstruktur.

## 1\. Filosofi Pengujian

Proyek ini mengadopsi filosofi pengujian yang berpusat pada **kualitas sejak awal**. Kami menggunakan pendekatan hybrid yang menggabungkan **Behavior-Driven Development (BDD)** untuk pengujian tingkat tinggi dan **Test-Driven Development (TDD)** untuk pengembangan di tingkat unit dan komponen.

Prinsip utama kami adalah **Piramida Pengujian**, yang menekankan penulisan lebih banyak tes yang cepat dan terisolasi di bagian bawah, dan lebih sedikit tes _end-to-end_ yang lebih lambat di bagian atas.

---

## 2\. Piramida Pengujian

Struktur pengujian kami mengikuti piramida klasik untuk memastikan cakupan yang efisien dan umpan balik yang cepat.

```bash
      /───────\   <-- Sedikit tes
     /  E2E    \      (Cypress + Cucumber) - Lambat & Mahal
    /───────────\
   / Integration \    (Vitest + RTL)
  /───────────────\
 / Component & Unit\  (Vitest + RTL) - Cepat & Murah
/───────────────────\ <-- Banyak tes
```

---

## 3\. Jenis Pengujian dan Fokusnya

Setiap lapisan piramida memiliki fokus, cakupan, dan tujuan yang spesifik. Definisi ini didasarkan pada praktik industri terkemuka untuk memastikan pengujian yang efektif.

### a. Unit Test (Dasar Piramida)

- **Penjelasan:** _Unit test_ adalah fondasi dari piramida. Tes ini memverifikasi "unit" logika terkecil yang terisolasi (satu fungsi, satu _hook_, atau satu _class_). Tes ini tidak boleh memiliki dependensi eksternal seperti _rendering_ DOM, panggilan API, atau _database_. Semua dependensi harus di-_mock_ (dipalsukan).
- **Tujuan:** Memastikan bahwa blok bangunan logika murni dari aplikasi Anda berfungsi sesuai dengan spesifikasi dalam berbagai skenario _input_ (termasuk _edge case_). Tes ini harus sangat cepat dan berjalan di lingkungan Node.js.
- **Apa yang Diuji:**
  - Fungsi utilitas (misal: `formatDate`, `validateEmail`).
  - Logika bisnis murni di dalam _custom hook_ (misal: `useAuth` - apakah `user` awalnya `null`? apakah `login()` mengubah _state_?).
  - Kasus-kasus _edge case_ (input `null`, `undefined`, string kosong, angka nol).
- **Contoh (`useAuth.spec.js`):**

  ```js
  // @vitest-environment node (Optimasi: tak perlu DOM)
  import { renderHook, act } from "@testing-library/react";
  import { useAuth } from "../useAuth";

  describe("useAuth Hook", () => {
    it("should have initial user as null", () => {
      const { result } = renderHook(() => useAuth());
      expect(result.current.user).toBeNull();
    });

    it("should set user after login", () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login({ username: "testuser" });
      });

      expect(result.current.user).toEqual({ username: "testuser" });
    });
  });
  ```

### b. Component Test

- **Penjelasan:** _Component test_ menguji satu komponen React secara terisolasi. Tidak seperti _unit test_, tes ini **memerlukan lingkungan DOM** (seperti `jsdom`) untuk me-_render_ komponen. Filosofi utamanya (dari React Testing Library) adalah menguji dari perspektif pengguna: "Apakah komponen me-_render_ output yang benar?" dan "Apakah ia bereaksi dengan benar terhadap interaksi pengguna?".
- **Tujuan:** Memvalidasi bahwa _rendering_ UI dan interaksi tingkat komponen bekerja. Tes ini tidak peduli pada _state_ internal atau detail implementasi, tetapi pada apa yang dilihat dan dapat dilakukan oleh pengguna.
- **Apa yang Diuji:**
  - **Render Kondisional:** Apakah _spinner_ tampil saat `isLoading={true}`?
  - **Interaksi Sederhana:** Apakah fungsi `onClick` pada `<Button>` dipanggil saat diklik?
  - **Tampilan Prop:** Apakah teks yang dilewatkan sebagai `children` atau `props` muncul di layar?
  - **Aksesibilitas Dasar:** Apakah tombol memiliki `role` yang benar? (RTL mendorong ini).
- **Contoh (`Button.spec.jsx`):**

  ```jsx
  import { render, screen } from "@testing-library/react";
  import userEvent from "@testing-library/user-event";
  import { Button } from "../Button";

  describe("Button Component", () => {
    it("should call onClick handler when clicked", async () => {
      const handleClick = vi.fn(); // Mock function
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Klik Saya</Button>);

      const button = screen.getByRole("button", { name: /klik saya/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled", () => {
      render(<Button disabled>Tidak bisa</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });
  ```

### c. Integration Test

- **Penjelasan:** _Integration test_ memverifikasi bagaimana **beberapa komponen bekerja sama** untuk menyelesaikan sebuah alur kerja kecil. Ini adalah langkah di atas _component test_. Alih-alih me-_render_ satu `<Button>`, Anda me-_render_ satu halaman atau _form_ utuh (misal: `<LoginForm>`) yang berisi beberapa komponen anak (`<Input>`, `<Button>`, `<ErrorMessage>`).
- **Tujuan:** Memastikan "sambungan" antar komponen berfungsi. Tes ini memvalidasi alur data dan _state management_ dalam skala yang lebih besar dari satu komponen. Panggilan API ke _backend_ **masih harus di-mock** (misalnya menggunakan Mock Service Worker/MSW) untuk menjaga tes tetap stabil dan cepat.
- **Apa yang Diuji:**
  - Alur pengisian _form_ (mengisi input, klik _submit_, melihat pesan sukses/error).
  - Interaksi _routing_ (klik _link_ dan pastikan halaman baru di-_render_).
  - _State management_ lintas komponen (misal, klik tombol pada satu komponen dan pastikan komponen lain diperbarui).
- **Contoh (`LoginPage.integration.spec.jsx`):**

  ```jsx
  // ... setup mock API (misal: msw)

  describe("Login Page Flow", () => {
    it("should show error message with invalid credentials", async () => {
      const user = userEvent.setup();
      render(<LoginPage />); // Render seluruh halaman

      // 1. Aksi pengguna
      await user.type(screen.getByLabelText(/email/i), "salah@mail.com");
      await user.type(screen.getByLabelText(/password/i), "123456");
      await user.click(screen.getByRole("button", { name: /login/i }));

      // 2. Verifikasi hasil (dari mock API)
      expect(
        await screen.findByText(/email atau password salah/i)
      ).toBeInTheDocument();
    });
  });
  ```

### d. End-to-End (E2E) Test

- **Penjelasan:** Ini adalah puncak piramida. _E2E test_ mensimulasikan perjalanan pengguna nyata melalui **keseluruhan aplikasi** di _browser_ sungguhan (bukan `jsdom`) dan terhubung ke **_backend_ sungguhan** (baik _live_, _staging_, atau lokal). Tes ini memvalidasi seluruh _stack_ teknologi (frontend, backend, API, database) bekerja bersama.
- **Tujuan:** Memastikan alur bisnis kritis (Critical User Journeys) berfungsi seperti yang diharapkan di lingkungan produksi. Karena lambat dan rapuh (_flaky_), jumlahnya harus paling sedikit dan hanya fokus pada "happy path". Di sinilah skenario BDD (`.feature`) paling sering digunakan.
- **Apa yang Diuji:**
  - Alur autentikasi (Registrasi -\> Login -\> Logout).
  - Alur bisnis utama (misal: "Pengguna mem-posting komentar dan komentarnya muncul").
  - Validasi integrasi _end-to-end_ yang tidak bisa di-_mock_.
- **Contoh (`authentication.feature` dijalankan oleh Cypress):**

  ```gherkin
  Feature: Authentication
    Scenario: User successfully logs in and logs out
      Given I am on the "/login" page
      When I fill "email" with "user_nyata@judi-guard.com"
      And I fill "password" with "passwordAsli123"
      And I click "Login"
      Then I should be redirected to "/dashboard"
      And I should see "Selamat datang, user_nyata"

      When I click "Logout"
      Then I should be redirected to "/login"
  ```

---

## 4\. Tools yang Digunakan

Pemilihan _tools_ didasarkan pada ekosistem teknologi proyek (Vite, React) dan metodologi yang diadopsi (BDD & TDD).

| Jenis Test           | Tools                  | Tujuan                                     | Konvensi File            |
| :------------------- | :--------------------- | :----------------------------------------- | :----------------------- |
| **Unit Test**        | **Vitest** + RTL       | Menguji logika murni (hooks, utils).       | `*.spec.js`              |
| **Component Test**   | **Vitest** + RTL       | Menguji render & interaksi 1 komponen.     | `*.spec.jsx`             |
| **Integration Test** | **Vitest** + RTL       | Menguji interaksi beberapa komponen/modul. | `*.integration.spec.jsx` |
| **E2E Behaviour**    | **Cypress** + Cucumber | Menguji alur pengguna _end-to-end_.        | `*.feature`              |

### Unit, Component, & Integration: Vitest + React Testing Library

- **Vitest**: Dipilih sebagai _test runner_ utama karena integrasi aslinya dengan **Vite**. Ini memberikan performa yang sangat cepat dan konfigurasi minimal, karena berjalan di atas server pengembangan Vite yang sudah ada. API-nya yang kompatibel dengan Jest membuatnya mudah diadopsi.
- **React Testing Library (RTL)**: Dipilih karena filosofinya yang sejalan dengan BDD, yaitu menguji aplikasi dari **sudut pandang pengguna**. RTL mendorong pengujian perilaku yang terlihat, bukan detail implementasi, menghasilkan tes yang lebih andal dan tidak mudah rusak saat _refactoring_.

### E2E & BDD: Cypress + Cypress Cucumber Preprocessor

- **Cypress**: Dipilih sebagai _framework_ E2E karena **pengalaman developer (DX)** yang superior. _Test Runner_-nya yang interaktif dan fitur _time-travel debugging_ sangat ideal untuk memvalidasi alur kerja pengguna secara visual, yang krusial untuk BDD.
- **Cypress Cucumber Preprocessor**: Dipilih sebagai **jembatan** antara file `.feature` yang ditulis dalam bahasa Gherkin dan _runner_ Cypress. Ini memungkinkan skenario BDD yang bisa dipahami semua orang menjadi tes otomatis yang dapat dieksekusi, menciptakan "Dokumentasi Hidup" (_Living Documentation_).

---

## 5\. Struktur Folder & Konvensi Penamaan

Untuk menjaga kerapian, tes dibagi menjadi dua lokasi utama:

1.  **Co-location (`__tests__`)**: Tes Unit, Component, dan Integration ditempatkan di dalam folder `__tests__` yang berada di direktori yang sama dengan kode sumbernya.
2.  **Folder Terpusat (`/tests`)**: Tes E2E dan BDD ditempatkan di folder `tests/` pada direktori _root_ proyek.

<!-- end list -->

```bash
packages/
├── frontend/
    ├── src/
    │   ├── components/
    │   │   └── ui/
    │   │       ├── __tests__/
    │   │       │   └── Button.spec.jsx      # Component Test
    │   │       └── Button.jsx
    │   ├── hooks/
    │   │   ├── __tests__/
    │   │   │   └── useAuth.spec.js          # Unit Test
    │   │   └── useAuth.js
    │   │
    |   └── pages/
    │       └── auth/
    │           ├── __tests__/
    │           |  └── Login.integration.spec.jsx   # Integration Tests (Pages, API, Store dll)
    │           ├── LoginPage.jsx
    │           └── RegisterPage.jsx
    |
    └── tests/
        └── e2e/
            ├── behaviours/
            │   └── authentication.feature   # BDD Scenario
            └── step_definitions/
                └── authSteps.js             # Implementasi tes Gherkin
```

---

## 6\. Alur Kerja & Cara Menjalankan Tes

#### Menjalankan Tes Unit, Component & Integration

Tes-tes ini dijalankan melalui Vitest di terminal dan sangat cepat.

```bash
# Menjalankan semua tes Vitest dalam mode watch
npm run test

# Menjalankan tes dan melihat coverage
npm run test:coverage
```

#### Menjalankan Tes E2E (BDD)

Tes E2E dijalankan melalui Cypress Test Runner yang interaktif.

```bash
# Membuka Cypress Test Runner
npm run cy:open
```

---

## 7\. Tabel Keunggulan Tools

Tabel berikut merangkum keunggulan utama dari setiap _tool_ yang dipilih.

### Vitest

⚡ Kecepatan Instan: Integrasi dengan Vite menghilangkan waktu kompilasi yang lama.

⚙️ Konfigurasi Nol: Bekerja langsung dengan konfigurasi proyek Vite.

🤝 Kompatibilitas Jest: API yang familiar memudahkan adopsi.

### React Testing Library

👨‍💻 Fokus Pengguna: Mendorong tes yang meniru cara pengguna berinteraksi.

🛠️ Anti Rapuh: Tes tidak mudah rusak karena perubahan implementasi internal.

♿ Meningkatkan Aksesibilitas: Kueri yang digunakan mendorong penulisan HTML yang lebih baik.

### Cypress

👀 Visual & Interaktif: Test Runner memungkinkan debugging secara visual dan real-time.

🕰️ Time-Travel Debugging: Mampu melihat snapshot aplikasi di setiap langkah tes.

⏳ Anti Flaky: Fitur _automatic waiting_ membuat tes lebih stabil dan andal.

### Cucumber Preprocessor

📖 Dokumentasi Hidup: Skenario .feature menjadi dokumentasi yang selalu sinkron.

👥 Kolaborasi Tim: Memungkinkan anggota non-teknis untuk membaca dan memvalidasi perilaku.

🔗 Jembatan BDD: Menghubungkan deskripsi perilaku dengan kode tes E2E secara rapi.
