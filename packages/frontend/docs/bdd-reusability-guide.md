# Panduan Reusability dan Refactoring Testing BDD

## Konsep Dasar

**Testing yang berulang** bisa berulang (reusable) dalam 2 konteks:
1. **Re-run testing** - Menjalankan ulang test yang sama berkali-kali
2. **Reuse code** - Menggunakan kembali komponen testing untuk skenario berbeda

---

## JAWABAN SINGKAT

**Yang direfactor: CODE TESTING nya! ❌ BUKAN aplikasinya**

**Prinsip penting:**
- ✅ **Aplikasi** tetap seperti apa adanya (objek yang dites)
- ✅ **Code testing** yang dibuat modular dan reusable
- ✅ Testing tidak boleh mengubah aplikasi (kecuali ada bug yang ditemukan)

---

## MENGAPA CODE TESTING YANG DIREFACTOR?

### 1. **Pemisahan Concerns (Separation of Concerns)**
```
┌─────────────────────┐
│   APLIKASI WEB      │  ← Ini yang DITES (tidak diubah)
│   (System Under     │
│    Test - SUT)      │
└─────────────────────┘
          ↑
          │ Testing
          │
┌─────────────────────┐
│   CODE TESTING      │  ← Ini yang DIREFACTOR
│   (Test Suite)      │     (dibuat reusable)
└─────────────────────┘
```

### 2. **Testing Harus Independen**
- Testing tidak boleh memodifikasi aplikasi
- Testing hanya **mengobservasi** dan **memverifikasi** behavior aplikasi
- Jika aplikasi berubah, test menyesuaikan (bukan sebaliknya)

---

## STRATEGI REFACTORING CODE TESTING

## 🎯 Strategi 1: Step Definitions yang Reusable

### ❌ **BURUK - Tidak Reusable**
```javascript
// login_steps.js
When('I login as admin', () => {
  cy.visit('/login');
  cy.get('#username').type('admin@example.com');
  cy.get('#password').type('admin123');
  cy.get('button[type="submit"]').click();
});

// register_steps.js  
When('I register as new user', () => {
  cy.visit('/register');
  cy.get('#username').type('newuser@example.com');
  cy.get('#password').type('pass123');
  cy.get('button[type="submit"]').click();
});

// profile_steps.js
When('I update my email', () => {
  cy.visit('/profile');
  cy.get('#email').clear();
  cy.get('#email').type('newemail@example.com');
  cy.get('button[type="submit"]').click();
});
```
**Masalah:** Kode duplikasi, sulit maintain, tidak flexible

---

### ✅ **BAGUS - Reusable dengan Parameters**

```javascript
// common_steps.js
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Step yang REUSABLE untuk semua halaman
Given('I am on the {string} page', (pageName) => {
  const pages = {
    'login': '/login',
    'register': '/register',
    'dashboard': '/dashboard',
    'profile': '/profile',
    'products': '/products'
  };
  cy.visit(pages[pageName]);
});

When('I fill {string} field with {string}', (fieldName, value) => {
  cy.get(`[data-testid="${fieldName}"]`).clear().type(value);
});

When('I click {string} button', (buttonText) => {
  cy.contains('button', buttonText).click();
});

Then('I should see {string} message', (message) => {
  cy.contains(message).should('be.visible');
});

Then('I should be on {string} page', (pageName) => {
  const pages = {
    'login': '/login',
    'dashboard': '/dashboard',
    'profile': '/profile'
  };
  cy.url().should('include', pages[pageName]);
});
```

**Sekarang bisa dipakai di SEMUA feature files:**

```gherkin
# login.feature
Scenario: Admin login
  Given I am on the "login" page
  When I fill "username" field with "admin@example.com"
  And I fill "password" field with "admin123"
  And I click "Login" button
  Then I should be on "dashboard" page
  And I should see "Welcome, Admin" message

# register.feature
Scenario: User registration
  Given I am on the "register" page
  When I fill "username" field with "newuser@example.com"
  And I fill "password" field with "newpass123"
  And I fill "confirmPassword" field with "newpass123"
  And I click "Register" button
  Then I should see "Registration successful" message

# profile.feature
Scenario: Update email
  Given I am on the "profile" page
  When I fill "email" field with "newemail@example.com"
  And I click "Save" button
  Then I should see "Email updated" message
```

**Keuntungan:**
- ✅ 1 step definition → dipakai di 10+ scenarios
- ✅ Maintenance mudah (ubah 1 tempat, semua terpengaruh)
- ✅ Flexible untuk scenario baru

---

## 🎯 Strategi 2: Page Object Model (POM)

### ❌ **BURUK - Hardcode Selector**
```javascript
// Selector tersebar di banyak step definitions
When('I login', () => {
  cy.get('#login-username').type('user@test.com');
  cy.get('#login-password').type('pass123');
  cy.get('.btn-login-submit').click();
});

When('I check username', () => {
  cy.get('#login-username').should('be.visible');
});
```
**Masalah:** Jika selector berubah, harus update di BANYAK tempat!

---

### ✅ **BAGUS - Page Object Model**

```javascript
// cypress/support/page_objects/LoginPage.js
class LoginPage {
  // Selectors dalam 1 tempat
  elements = {
    usernameInput: () => cy.get('[data-testid="username"]'),
    passwordInput: () => cy.get('[data-testid="password"]'),
    loginButton: () => cy.get('[data-testid="login-button"]'),
    errorMessage: () => cy.get('[data-testid="error-message"]'),
    successMessage: () => cy.get('[data-testid="success-message"]')
  };

  // Methods yang reusable
  visit() {
    cy.visit('/login');
  }

  fillUsername(username) {
    this.elements.usernameInput().clear().type(username);
  }

  fillPassword(password) {
    this.elements.passwordInput().type(password);
  }

  clickLogin() {
    this.elements.loginButton().click();
  }

  // Composite action - kombinasi beberapa action
  login(username, password) {
    this.fillUsername(username);
    this.fillPassword(password);
    this.clickLogin();
  }

  // Verifications
  shouldShowError(message) {
    this.elements.errorMessage().should('contain', message);
  }

  shouldBeRedirectedToDashboard() {
    cy.url().should('include', '/dashboard');
  }
}

export default new LoginPage();
```

**Penggunaan di Step Definitions:**

```javascript
// step_definitions/login_steps.js
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../support/page_objects/LoginPage";

Given('I am on the login page', () => {
  LoginPage.visit();
});

When('I enter username {string}', (username) => {
  LoginPage.fillUsername(username);
});

When('I enter password {string}', (password) => {
  LoginPage.fillPassword(password);
});

When('I click login button', () => {
  LoginPage.clickLogin();
});

// Atau lebih simple dengan composite method
When('I login with {string} and {string}', (username, password) => {
  LoginPage.login(username, password);
});

Then('I should see error {string}', (message) => {
  LoginPage.shouldShowError(message);
});

Then('I should be redirected to dashboard', () => {
  LoginPage.shouldBeRedirectedToDashboard();
});
```

**Keuntungan:**
- ✅ Selector berubah? Update 1 file saja (LoginPage.js)
- ✅ Logic testing terpisah dari implementasi UI
- ✅ Easy to maintain

---

## 🎯 Strategi 3: Custom Commands (Cypress)

### ✅ **Membuat Helper Functions Reusable**

```javascript
// cypress/support/commands.js

// Command untuk login (dipakai berkali-kali)
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('[data-testid="username"]').type(username);
  cy.get('[data-testid="password"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Command untuk create data (setup test data)
Cypress.Commands.add('createProduct', (productData) => {
  cy.request({
    method: 'POST',
    url: '/api/products',
    body: productData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
});

// Command untuk cleanup (reset data setelah test)
Cypress.Commands.add('deleteAllProducts', () => {
  cy.request({
    method: 'DELETE',
    url: '/api/products/all',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
});

// Command untuk wait API call tertentu
Cypress.Commands.add('waitForProductsLoad', () => {
  cy.intercept('GET', '/api/products').as('getProducts');
  cy.wait('@getProducts');
});
```

**Penggunaan:**

```javascript
// Di step definitions atau langsung di test
beforeEach(() => {
  cy.login('admin@test.com', 'admin123'); // ← Reusable!
});

When('I create a new product', () => {
  cy.createProduct({ 
    name: 'New Product', 
    price: 100 
  }); // ← Reusable!
});

afterEach(() => {
  cy.deleteAllProducts(); // ← Cleanup reusable!
});
```

---

## 🎯 Strategi 4: Fixtures untuk Test Data

### ❌ **BURUK - Hardcoded Data**
```javascript
When('I create products', () => {
  cy.createProduct('Product A', 100);
  cy.createProduct('Product B', 200);
  cy.createProduct('Product C', 300);
});
```

---

### ✅ **BAGUS - Fixtures (External Test Data)**

```json
// cypress/fixtures/products.json
{
  "validProducts": [
    {
      "name": "Laptop Dell",
      "price": 15000000,
      "category": "Electronics",
      "stock": 10
    },
    {
      "name": "Mouse Logitech",
      "price": 250000,
      "category": "Electronics",
      "stock": 50
    }
  ],
  "invalidProducts": [
    {
      "name": "",
      "price": -100,
      "category": "Invalid"
    }
  ]
}
```

```json
// cypress/fixtures/users.json
{
  "admin": {
    "username": "admin@test.com",
    "password": "Admin123!",
    "role": "admin"
  },
  "regularUser": {
    "username": "user@test.com",
    "password": "User123!",
    "role": "user"
  },
  "invalidUser": {
    "username": "invalid@test.com",
    "password": "wrong"
  }
}
```

**Penggunaan:**

```javascript
// step_definitions/product_steps.js
let testData;

before(() => {
  cy.fixture('products').then((data) => {
    testData = data;
  });
});

When('I create valid products', () => {
  testData.validProducts.forEach(product => {
    cy.createProduct(product);
  });
});

When('I try to create invalid product', () => {
  cy.createProduct(testData.invalidProducts[0]);
});
```

**Di Feature File bisa menggunakan Examples:**

```gherkin
Scenario Outline: Login with different users
  Given I am on the login page
  When I login with "<username>" and "<password>"
  Then I should see "<result>"

  Examples:
    | username          | password  | result              |
    | admin@test.com    | Admin123! | Dashboard           |
    | user@test.com     | User123!  | Dashboard           |
    | invalid@test.com  | wrong     | Invalid credentials |
```

---

## 🎯 Strategi 5: Background & Hooks (Setup/Teardown)

### ✅ **Background - Setup di Gherkin**

```gherkin
Feature: Product Management

  Background: User is logged in
    Given I am logged in as "admin"
    And I am on the "products" page

  Scenario: Create new product
    When I click "Add Product" button
    And I fill product details
    Then product should be created

  Scenario: Edit existing product
    When I click edit on first product
    And I update product name
    Then product should be updated

  Scenario: Delete product
    When I click delete on first product
    Then product should be deleted
```
**Background berjalan sebelum SETIAP scenario** → DRY principle!

---

### ✅ **Hooks - Setup/Teardown di Code**

```javascript
// cypress/support/e2e.js atau di step definitions

// Berjalan SEKALI sebelum semua test
before(() => {
  cy.log('Starting test suite');
  // Setup database, seed data, dll
});

// Berjalan sebelum SETIAP test
beforeEach(() => {
  // Reset state, clear cookies, dll
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Login otomatis untuk setiap test
  cy.login('admin@test.com', 'admin123');
});

// Berjalan setelah SETIAP test
afterEach(() => {
  // Cleanup: hapus data test
  cy.deleteTestData();
  
  // Screenshot jika test gagal
  if (this.currentTest.state === 'failed') {
    cy.screenshot(`failed-${this.currentTest.title}`);
  }
});

// Berjalan SEKALI setelah semua test
after(() => {
  cy.log('Test suite completed');
  // Cleanup global
});
```

---

## 🔄 KAPAN APLIKASI YANG DIUBAH?

Aplikasi HANYA diubah jika:

### 1. **Ditemukan Bug** (dari hasil testing)
```
Test menemukan: Login button tidak berfungsi
→ Developer FIX bug di aplikasi
→ Re-run test untuk verify fix
```

### 2. **Testability Improvements** (opsional, untuk memudahkan testing)

#### Contoh: Menambahkan data-testid

**Sebelum (sulit dites):**
```html
<!-- Aplikasi tanpa test identifier -->
<button class="btn btn-primary mt-3">Login</button>
<input type="text" class="form-control" />
```

**Sesudah (mudah dites):**
```html
<!-- Dengan data-testid untuk testing -->
<button class="btn btn-primary mt-3" data-testid="login-button">
  Login
</button>
<input 
  type="text" 
  class="form-control"
  data-testid="username-input"
/>
```

**Keuntungan:**
- Test tidak bergantung pada CSS classes (yang bisa berubah)
- Selector lebih stable dan semantic
- Testing lebih maintainable

**Dalam skripsi Anda:**
- Ini bisa jadi "Rekomendasi Improvement" di BAB 5
- Jelaskan sebagai best practice untuk testability

---

## 📊 PERBANDINGAN: Sebelum vs Sesudah Refactoring

### Sebelum Refactoring:
```
❌ 50 test scenarios
❌ 500 lines of duplicate code
❌ Selector hardcoded di 100+ tempat
❌ Maintenance time: 2 jam per perubahan UI
❌ Test brittle (mudah break)
```

### Sesudah Refactoring:
```
✅ 50 test scenarios (sama)
✅ 200 lines of reusable code (60% reduction!)
✅ Selector centralized di Page Objects (5 files)
✅ Maintenance time: 10 menit per perubahan UI
✅ Test robust (tidak mudah break)
```

---

## 📝 UNTUK SKRIPSI ANDA

### Di BAB 3 (Metodologi):
```markdown
### 3.X Strategi Reusability Testing

Untuk meningkatkan maintainability dan mengurangi duplikasi kode,
penelitian ini menerapkan beberapa strategi:

1. **Page Object Model (POM)**: Memisahkan locator dan logic UI
2. **Reusable Step Definitions**: Menggunakan parameterized steps
3. **Custom Commands**: Helper functions untuk operasi umum
4. **Fixtures**: External test data management
5. **Hooks**: Automated setup dan teardown

Strategi ini memastikan test suite yang scalable dan mudah 
di-maintain untuk pengembangan jangka panjang.
```

### Di BAB 4 (Hasil):
```markdown
### 4.X Metrics Reusability

Setelah refactoring, diperoleh hasil:
- Code reuse rate: 75%
- Maintenance time reduction: 80%
- Lines of code reduction: 60%
- Test execution time: sama (tidak terpengaruh)
```

### Di BAB 5 (Kesimpulan):
```markdown
Implementasi strategi reusability terbukti meningkatkan
efisiensi maintenance test suite sebesar 80%, dengan
code reduction 60% tanpa mengurangi coverage testing.
```

---

## 💡 KEY TAKEAWAYS

1. **❌ JANGAN refactor aplikasi** untuk keperluan testing
2. **✅ REFACTOR code testing** agar reusable dan maintainable
3. **✅ Gunakan POM** untuk manage UI locators
4. **✅ Parametrize step definitions** untuk flexibility
5. **✅ Centralize test data** di fixtures
6. **✅ Implementasi hooks** untuk setup/teardown otomatis
7. **✅ Aplikasi hanya diubah** jika ada bug atau improvement testability

---

## 🎯 ACTION PLAN

### Minggu 9-11 (Fase Implementasi):
```
Week 9:
- Buat structure POM
- Implement basic step definitions
- Setup fixtures

Week 10:
- Refactor ke reusable steps
- Implement custom commands
- Add hooks

Week 11:
- Code review & refactor
- Documentation
- Measure metrics (reusability rate)
```

### Deliverables:
- [ ] Page Object files (5-10 files)
- [ ] Reusable step definitions (10-15 files)
- [ ] Custom commands (1 file)
- [ ] Fixtures (3-5 files)
- [ ] Documentation: Reusability Strategy

---

**Kesimpulan:** Testing yang bagus adalah testing yang **CLEAN**, **DRY** (Don't Repeat Yourself), dan **MAINTAINABLE** melalui refactoring CODE TESTING, bukan aplikasinya! 🚀