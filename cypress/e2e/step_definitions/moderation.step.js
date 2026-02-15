import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("User is on the analysis results page with comments", () => {
  const videoId = "eeKxI45uZ0Y";
  cy.intercept("GET", "**/api/videos*", { fixture: "video_list.json" });
  cy.fixture("search_result.json").then((d) =>
    cy.intercept("GET", "**/api/videos/search*", {
      body: { status: "success", data: d },
    }),
  );
  cy.fixture("comment_list.json").then((d) =>
    cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
      body: { status: "success", data: { comments: d, nextPageToken: null } },
    }),
  );
  cy.intercept("POST", "**/api/analysis/*", { fixture: "analysis_start.json" });
  cy.intercept("GET", "**/api/analysis/status/*", {
    fixture: "status_completed.json",
  });
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "results_initial.json",
  }).as("getResultsInitial");
  cy.visit("/dashboard/analysis");
  cy.get('[data-cy="input-video-link"]').type(
    `https://youtube.com/watch?v=${videoId}`,
  );
  cy.get('[data-cy="btn-search"]').click();
  cy.contains("button", "Mulai Analisis AI").click();
  cy.wait("@getResultsInitial");
  cy.contains("Hasil Analisis Video").should("be.visible");
});

When("User selects comment from {string}", (authorName) => {
  cy.contains(authorName).parents("tr").find("input[type='checkbox']").check();
});

When("User selects all comments in the list", () => {
  cy.get("thead input[type='checkbox']").check();
});

When("User clicks delete button", () => {
  cy.contains("button", "Hapus Komentar").click();
});

When("User confirms deletion with {string} option enabled", (optionLabel) => {
  cy.intercept("POST", "**/api/analysis/*/action", {
    fixture: "action_success.json",
  }).as("postActionDelete");
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "results_deleted.json",
  }).as("getResultsDeleted");
  cy.contains("label", "Blokir Penulis Juga").click();
  cy.get("div[role='alertdialog']")
    .contains("button", "Ya, Hapus Sekarang")
    .click();
  cy.wait("@postActionDelete");
  cy.wait("@getResultsDeleted");
});

When("User confirms deletion without Ban Author", () => {
  cy.intercept("POST", "**/api/analysis/*/action", {
    fixture: "action_success.json",
  }).as("postActionDelete");
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "results_deleted.json",
  }).as("getResultsDeleted");
  cy.get("div[role='alertdialog']")
    .contains("button", "Ya, Hapus Sekarang")
    .click();
  cy.wait("@postActionDelete");
  cy.wait("@getResultsDeleted");
});

Then("System updates the comment status to {string}", (statusLabel) => {
  cy.contains("span", statusLabel).should("be.visible");
  cy.contains("Spammer Fixture")
    .parents("tr")
    .find("input[type='checkbox']")
    .should("not.be.checked");
});

Then(
  "System updates all selected comments status to {string}",
  (statusLabel) => {
    cy.contains("Spammer Fixture")
      .parents("tr")
      .within(() => {
        cy.contains("span", statusLabel).should("be.visible");
      });
    cy.contains("Good User")
      .parents("tr")
      .within(() => {
        cy.contains("span", statusLabel).should("not.exist");
      });
  },
);

Then("System displays a success notification with Undo option", () => {
  cy.contains("Berhasil menghapus").should("be.visible");
  cy.contains("button", "UNDO SEKARANG").should("be.visible");
});

Given("A comment has been deleted recently", () => {
  const videoId = "eeKxI45uZ0Y";
  cy.intercept("GET", "**/api/videos*", { fixture: "video_list.json" });
  cy.fixture("search_result.json").then((d) =>
    cy.intercept("GET", "**/api/videos/search*", {
      body: { status: "success", data: d },
    }),
  );
  cy.fixture("comment_list.json").then((d) =>
    cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
      body: { status: "success", data: { comments: d, nextPageToken: null } },
    }),
  );
  cy.intercept("POST", "**/api/analysis/*", { fixture: "analysis_start.json" });
  cy.intercept("GET", "**/api/analysis/status/*", {
    fixture: "status_completed.json",
  });
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "results_initial.json",
  }).as("getResultsInit");
  cy.visit("/dashboard/analysis");
  cy.get('[data-cy="input-video-link"]').type(
    `https://youtube.com/watch?v=${videoId}`,
  );
  cy.get('[data-cy="btn-search"]').click();
  cy.contains("button", "Mulai Analisis AI").click();
  cy.wait("@getResultsInit");
  cy.contains("Spammer Fixture")
    .parents("tr")
    .find("input[type='checkbox']")
    .check();
  cy.intercept("POST", "**/api/analysis/*/action", {
    fixture: "action_success.json",
  }).as("postDel");
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "results_deleted.json",
  }).as("getResultsDel");
  cy.contains("button", "Hapus Komentar").click();
  cy.get("div[role='alertdialog']")
    .contains("button", "Ya, Hapus Sekarang")
    .click();
  cy.wait("@postDel");
  cy.wait("@getResultsDel");

  cy.contains("button", "UNDO SEKARANG").should("be.visible");
});

When("User clicks {string} on the notification", (btnText) => {
  cy.intercept("POST", "**/api/analysis/*/undo", {
    statusCode: 200,
    body: { status: "success", message: "Undo berhasil" },
  }).as("postUndo");
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "results_initial.json",
  }).as("getResultsRestored");
  cy.contains("button", btnText).click();
  cy.wait("@postUndo");
  cy.wait("@getResultsRestored");
});

Then("System restores the comment status to Active", () => {
  cy.contains("span", "Dihapus").should("not.exist");
  cy.contains("Komentar berhasil dikembalikan").should("be.visible");
});
