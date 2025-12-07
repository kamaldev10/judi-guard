# Panduan Lengkap Skripsi: Testing BDD pada Aplikasi Web

## Referensi Penelitian

**Judul**: Analisis Implementasi Behavior Driven Development (BDD) Melalui Kasus Uji pada Aplikasi Web Sentratekstil

**Sumber**: Repository Telkom University

**Metodologi**: BDD dengan automated testing menggunakan Gherkin syntax

---

## BAB 1: PENDAHULUAN

### 1.1 Latar Belakang
- Aplikasi web modern membutuhkan testing yang komprehensif
- Kesenjangan komunikasi antara developer, tester, dan stakeholder bisnis
- BDD sebagai solusi untuk dokumentasi dan testing yang readable
- Pentingnya automated testing untuk meningkatkan kualitas software

### 1.2 Rumusan Masalah
1. Bagaimana mengimplementasikan BDD pada aplikasi web [nama aplikasi]?
2. Apakah BDD dapat meningkatkan kualitas testing dan mendeteksi bug?
3. Bagaimana tingkat kepuasan pengguna terhadap aplikasi setelah testing BDD?

### 1.3 Tujuan Penelitian
1. Menganalisis kebutuhan sistem melalui elisitasi
2. Mengimplementasikan BDD testing dengan automated tools
3. Menemukan dan mendokumentasikan bug aplikasi
4. Mengukur kepuasan pengguna terhadap aplikasi

### 1.4 Batasan Masalah
- Testing fokus pada functional requirements
- Testing dilakukan pada environment [development/staging]
- Tools yang digunakan: Cypress + Cucumber (BDD framework)
- Browser yang diuji: Chrome, Firefox, Edge

### 1.5 Manfaat Penelitian
- **Bagi Developer**: Dokumentasi test case yang jelas
- **Bagi Tester**: Automated testing yang efisien
- **Bagi Organisasi**: Meningkatkan kualitas software

---

## BAB 2: LANDASAN TEORI

### 2.1 Software Testing
- Definisi dan tujuan
- Jenis-jenis testing (Unit, Integration, E2E)
- Testing lifecycle

### 2.2 Behavior Driven Development (BDD)
- Definisi BDD
- Prinsip-prinsip BDD
- Perbedaan BDD vs TDD
- Gherkin syntax (Given-When-Then)

### 2.3 Tools Testing
- Cypress overview
- Cucumber/BDD framework
- Integration Cypress + Cucumber

### 2.4 Elisitasi Kebutuhan
- Metode elisitasi
- Functional vs Non-Functional Requirements
- Use Case Diagram

---

## BAB 3: METODOLOGI PENELITIAN

### 3.1 Metodologi
**Metode Penelitian**: Case Study dengan pendekatan kualitatif dan kuantitatif

### 3.2 Tahapan Penelitian

#### **FASE 1: Perencanaan (Minggu 1-2)**

**Kegiatan:**
1. Studi literatur tentang BDD dan testing
2. Identifikasi stakeholder
3. Persiapan tools dan environment

**Output:**
- Proposal penelitian
- Daftar stakeholder
- Setup environment testing

---

#### **FASE 2: Elisitasi Kebutuhan (Minggu 3-4)**

**Kegiatan:**
1. Wawancara dengan developer/product owner
   - Tujuan aplikasi
   - Fitur-fitur utama
   - Pain points yang ada

2. Observasi sistem yang berjalan
   - User flow
   - Business process
   - Existing bugs/issues

3. Kuesioner untuk pengguna
   - Kepuasan terhadap fitur
   - Usability issues
   - Feature request

**Output:**
- Transkrip wawancara
- Daftar kebutuhan fungsional (FR)
- Daftar kebutuhan non-fungsional (NFR)
- Hasil kuesioner awal

**Template Kebutuhan:**
```
FR-001: User harus dapat melakukan login
FR-002: User harus dapat melihat dashboard
FR-003: User harus dapat mengelola data produk
...
NFR-001: Response time < 3 detik
NFR-002: Sistem dapat diakses 24/7
```

---

#### **FASE 3: Analisis dan Desain (Minggu 5-6)**

**Kegiatan:**
1. Membuat Use Case Diagram
   - Identifikasi aktor (admin, user, guest)
   - Identifikasi use case utama
   - Define relationships

2. Membuat User Stories
   ```
   As a [role]
   I want to [action]
   So that [benefit]
   ```

3. Mapping FR ke Use Case

**Output:**
- Use Case Diagram
- Use Case Specification
- User Stories (minimal 15-20 stories)
- Traceability matrix (FR → Use Case → User Story)

---

#### **FASE 4: Desain Test Case BDD (Minggu 7-8)**

**Kegiatan:**
1. Konversi User Stories ke BDD Scenarios
2. Menulis Feature Files (Gherkin syntax)
3. Review dengan stakeholder

**Format BDD Scenario:**
```gherkin
Feature: User Login
  As a registered user
  I want to login to the system
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid username "user@example.com"
    And I enter valid password "Password123"
    And I click the login button
    Then I should see the dashboard page
    And I should see welcome message "Welcome, User"

  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter invalid username "wrong@example.com"
    And I enter password "wrongpass"
    And I click the login button
    Then I should see error message "Invalid credentials"
    And I should remain on login page
```

**Output:**
- 20-30 Feature files
- 50-100 BDD scenarios
- Test data preparation

---

#### **FASE 5: Implementasi Automated Testing (Minggu 9-11)**

**Kegiatan:**

**Step 1: Setup Project**
```bash
npm init -y
npm install cypress @badeball/cypress-cucumber-preprocessor --save-dev
```

**Step 2: Konfigurasi Cypress**
```javascript
// cypress.config.js
const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const preprocessor = require("@badeball/cypress-cucumber-preprocessor");
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild");

module.exports = defineConfig({
  e2e: {
    specPattern: "**/*.feature",
    async setupNodeEvents(on, config) {
      await preprocessor.addCucumberPreprocessorPlugin(on, config);
      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );
      return config;
    },
  },
});
```

**Step 3: Implementasi Step Definitions**
```javascript
// cypress/e2e/step_definitions/login_steps.js
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('I am on the login page', () => {
  cy.visit('/login');
});

When('I enter valid username {string}', (username) => {
  cy.get('[data-testid="username"]').type(username);
});

When('I enter valid password {string}', (password) => {
  cy.get('[data-testid="password"]').type(password);
});

When('I click the login button', () => {
  cy.get('[data-testid="login-button"]').click();
});

Then('I should see the dashboard page', () => {
  cy.url().should('include', '/dashboard');
});

Then('I should see welcome message {string}', (message) => {
  cy.contains(message).should('be.visible');
});
```

**Output:**
- Complete test automation code
- Page Object Models
- Helper functions
- Test utilities

---

#### **FASE 6: Eksekusi Testing (Minggu 12-13)**

**Kegiatan:**
1. Menjalankan automated tests
2. Dokumentasi hasil testing
3. Bug reporting dan tracking

**Eksekusi:**
```bash
# Run all tests
npx cypress run

# Run specific feature
npx cypress run --spec "cypress/e2e/features/login.feature"

# Run with browser
npx cypress run --browser chrome

# Open Cypress UI
npx cypress open
```

**Bug Report Template:**
```
BUG-001
Title: Login button tidak responsive pada mobile
Severity: High
Priority: High
Steps to Reproduce:
1. Buka aplikasi di mobile browser
2. Masukkan kredensial
3. Klik tombol login
Expected Result: Button dapat diklik
Actual Result: Button tidak merespon
Screenshot: [attach]
Browser: Chrome Mobile
Status: Open
```

**Output:**
- Test execution report
- Bug list (minimal 10-20 bugs)
- Screenshots/videos evidence
- Pass/Fail metrics

---

#### **FASE 7: Analisis Hasil (Minggu 14-15)**

**Kegiatan:**
1. Analisis coverage testing
2. Kategorisasi bug
3. Perhitungan metrics
4. Kuesioner kepuasan pasca-testing

**Metrics yang Diukur:**
- Test Coverage: (Tested Features / Total Features) × 100%
- Pass Rate: (Passed Tests / Total Tests) × 100%
- Bug Density: Total Bugs / Total Features
- Bug Severity Distribution: Critical, High, Medium, Low

**Kuesioner Kepuasan:**
- Skala Likert 1-5
- Minimal 20 responden
- Aspek: Functionality, Usability, Performance, Reliability

**Output:**
- Laporan analisis
- Grafik dan tabel metrics
- Hasil kuesioner (tingkat kepuasan %)
- Rekomendasi improvement

---

#### **FASE 8: Dokumentasi (Minggu 16)**

**Kegiatan:**
1. Finalisasi skripsi
2. Pembuatan user guide
3. Presentasi hasil

**Output:**
- Dokumen skripsi lengkap
- Source code testing
- Test report
- Presentasi PPT

---

## TIMELINE KESELURUHAN (16 Minggu / 4 Bulan)

```
Minggu 1-2   : Perencanaan & Studi Literatur
Minggu 3-4   : Elisitasi Kebutuhan
Minggu 5-6   : Analisis & Desain Use Case
Minggu 7-8   : Desain BDD Test Cases
Minggu 9-11  : Implementasi Automated Testing
Minggu 12-13 : Eksekusi Testing & Bug Reporting
Minggu 14-15 : Analisis Hasil & Kuesioner
Minggu 16    : Dokumentasi & Finalisasi
```

---

## BAB 4: HASIL DAN PEMBAHASAN

### 4.1 Hasil Elisitasi
- Daftar 14 FR dan 3 NFR
- Use Case Diagram (3 aktor, 9 use case)
- User Stories

### 4.2 Implementasi BDD
- Feature files yang dibuat
- Total scenarios: X scenarios
- Step definitions implementation

### 4.3 Hasil Testing
**Tabel: Test Execution Summary**
| Module | Total Tests | Passed | Failed | Pass Rate |
|--------|-------------|--------|--------|-----------|
| Login | 10 | 8 | 2 | 80% |
| Dashboard | 15 | 13 | 2 | 86.7% |
| Product Mgmt | 20 | 16 | 4 | 80% |
| **TOTAL** | **45** | **37** | **8** | **82.2%** |

**Bug Distribution:**
- Critical: 2 bugs
- High: 3 bugs
- Medium: 5 bugs
- Low: 8 bugs
- Total: 18 bugs

### 4.4 Analisis Kepuasan Pengguna
- Response rate: X%
- Kepuasan: 78.9% (kategori Baik)
- Aspek tertinggi: Functionality (85%)
- Aspek terendah: Performance (72%)

### 4.5 Pembahasan
- BDD berhasil meningkatkan kolaborasi tim
- Automated testing mengurangi waktu testing 60%
- Documentation yang readable memudahkan maintenance
- Limitations dan challenges yang dihadapi

---

## BAB 5: KESIMPULAN DAN SARAN

### 5.1 Kesimpulan
1. BDD berhasil diimplementasikan dengan X feature files dan Y scenarios
2. Testing menemukan 18 bugs dengan tingkat pass rate 82.2%
3. Kepuasan pengguna mencapai 78.9% (kategori Baik)
4. BDD meningkatkan kualitas dokumentasi dan testing

### 5.2 Saran
**Untuk Pengembangan Aplikasi:**
- Fix bug dengan prioritas tinggi
- Improve performance di area X
- Tambahkan fitur Y berdasarkan feedback

**Untuk Penelitian Selanjutnya:**
- Implementasi BDD untuk testing API
- Integrasi dengan CI/CD pipeline
- Performance testing dengan BDD approach
- Visual regression testing

---

## LAMPIRAN

### A. Kode Testing
- Feature files
- Step definitions
- Page objects
- Configuration files

### B. Dokumentasi
- Hasil wawancara
- Kuesioner
- Bug reports
- Test execution screenshots

### C. Tools dan Dependencies
```json
{
  "devDependencies": {
    "cypress": "^13.0.0",
    "@badeball/cypress-cucumber-preprocessor": "^20.0.0",
    "@bahmutov/cypress-esbuild-preprocessor": "^2.2.0"
  }
}
```

---

## CHECKLIST DELIVERABLES

### Dokumen:
- [ ] Proposal skripsi
- [ ] BAB 1-5 lengkap
- [ ] Abstrak (Indonesia & Inggris)
- [ ] Daftar pustaka minimal 20 referensi
- [ ] Lembar persetujuan & pengesahan

### Artifak:
- [ ] Source code testing (GitHub repo)
- [ ] Feature files (20-30 files)
- [ ] Test execution report
- [ ] Bug tracking spreadsheet
- [ ] Use case diagram
- [ ] Traceability matrix
- [ ] Kuesioner & hasil analisis
- [ ] Video demo testing

### Presentasi:
- [ ] PPT presentasi
- [ ] Demo aplikasi
- [ ] Demo automated testing
- [ ] Q&A preparation

---

## TIPS SUKSES

1. **Konsistensi**: Jalankan testing secara berkala
2. **Dokumentasi**: Catat setiap langkah dan hasil
3. **Komunikasi**: Koordinasi rutin dengan pembimbing
4. **Version Control**: Gunakan Git untuk tracking progress
5. **Backup**: Simpan data di multiple locations
6. **Time Management**: Ikuti timeline yang sudah dibuat
7. **Quality over Quantity**: Fokus pada kualitas test case
8. **Real User Perspective**: Tulis scenarios dari sudut pandang user

---

## CONTOH STRUKTUR FOLDER PROJECT

```
skripsi-bdd-testing/
├── cypress/
│   ├── e2e/
│   │   ├── features/
│   │   │   ├── 01-authentication/
│   │   │   │   ├── login.feature
│   │   │   │   └── register.feature
│   │   │   ├── 02-dashboard/
│   │   │   │   └── dashboard.feature
│   │   │   └── 03-products/
│   │   │       ├── create-product.feature
│   │   │       ├── edit-product.feature
│   │   │       └── delete-product.feature
│   │   └── step_definitions/
│   │       ├── authentication/
│   │       ├── dashboard/
│   │       └── products/
│   ├── fixtures/
│   │   ├── users.json
│   │   └── products.json
│   ├── support/
│   │   ├── commands.js
│   │   ├── e2e.js
│   │   └── page_objects/
│   └── screenshots/
├── docs/
│   ├── requirements/
│   ├── use-cases/
│   ├── test-reports/
│   └── bug-reports/
├── cypress.config.js
├── package.json
└── README.md
```

---

**Good luck dengan skripsi Anda! 🎓**