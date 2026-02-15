import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("History data exists", () => {
  cy.intercept("GET", "**/api/analysis/history*", {
    fixture: "history_list.json",
  }).as("getHistory");
});

Given("User is on the analysis history page", () => {
  cy.intercept("GET", "**/api/analysis/history*", {
    fixture: "history_list.json",
  }).as("getHistory");
  cy.visit("/dashboard/history");
  cy.wait("@getHistory");
});

When("User opens the analysis history page", () => {
  cy.visit("/dashboard/history");
});

Then("System displays analysis and moderation records in a table", () => {
  cy.wait("@getHistory");
  cy.contains("h1", "Riwayat Analisis").should("be.visible");
  cy.contains("Tutorial Cara Menang Slot").should("be.visible");
  cy.contains("Belajar React untuk Pemula").should("be.visible");
  cy.contains("span", "Bersih")
    .should("be.visible")
    .and("have.class", "text-green-800");
  cy.contains("span", "Sebagian")
    .should("be.visible")
    .and("have.class", "text-yellow-800");
});

When("User opens the report dialog", () => {
  cy.contains("button", "Laporan Periode").click();
  cy.contains("h2", "Cetak Laporan Aktivitas").should("be.visible");
});

When("User selects a date period {string} to {string}", (startDay, endDay) => {
  cy.contains("button", "Pilih Tanggal Mulai - Selesai").click();
  cy.get(".rdp-day:not(.rdp-day_outside)")
    .contains(new RegExp(`^${startDay}$`))
    .first()
    .click();
  cy.get(".rdp-day:not(.rdp-day_outside)")
    .contains(new RegExp(`^${endDay}$`))
    .first()
    .click();
  cy.get("body").type("{esc}");
});

When("User generates the preview", () => {
  cy.intercept("GET", "**/api/analysis/report/preview*", {
    fixture: "report_preview.json",
  }).as("getReportPreview");
  cy.contains("button", "Preview").should("not.be.disabled").click();
  cy.wait("@getReportPreview");
});

Then("System displays the report summary statistics", () => {
  cy.contains("Total Video").parent().should("contain", "5");
  cy.contains("Total Komentar").parent().should("contain", "500");
  cy.contains("Spam Ditemukan").parent().should("contain", "50");
  cy.contains("Tutorial Cara Menang Slot").should("be.visible");
  cy.contains("45 Spam").should("be.visible");
});

When("User clicks download PDF", () => {
  cy.intercept("GET", "**/api/analysis/report/download*", {
    statusCode: 200,
    body: "DUMMY_PDF",
    headers: { "content-type": "application/pdf" },
  }).as("downloadReport");
  cy.contains("button", "Download PDF Lengkap")
    .should("not.be.disabled")
    .click();
});

Then("System generates and downloads the report file", () => {
  cy.wait("@downloadReport");
  cy.get("body").type("{esc}");
  cy.contains("Laporan berhasil diunduh").should("be.visible");
});
