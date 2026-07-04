import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("User is on the configuration page", () => {
  cy.intercept("GET", "**/api/config/whitelist", {
    statusCode: 200,
    body: {
      status: "success",
      count: 1,
      data: [
        {
          _id: "wl_123",
          channelId: "@UCbX_TueacKEifdw8lAjARNQ",
          channelName: "Nadia Omara",
          note: "Horror Podcast",
        },
      ],
    },
  }).as("getWhitelist");
  cy.intercept("GET", "**/api/config/blacklist", {
    statusCode: 200,
    body: {
      status: "success",
      count: 1,
      data: [{ _id: "bl_456", keyword: "zeus" }],
    },
  }).as("getBlacklist");
  cy.visit("/dashboard/config");
  cy.wait(["@getWhitelist", "@getBlacklist"]);
});

// ===== Whitelist Steps =====
Given("The whitelist table contains {string}", (channelName) => {
  cy.contains(channelName).should("be.visible");
});

When("User adds {string} to whitelist", (channelInput) => {
  cy.intercept("POST", "**/api/config/whitelist", {
    statusCode: 201,
    body: {
      status: "success",
      data: {
        _id: "wl_new_basic",
        channelId: channelInput,
        channelName: "Unknown Channel",
        note: "",
      },
    },
  }).as("addWhitelist");
  cy.get('input[name="channelId"]').clear().type(channelInput);
  cy.contains("button", "Tambah").click();
  cy.wait("@addWhitelist");
});

When(
  "User adds {string} with name {string} and note {string} to whitelist",
  (id, name, note) => {
    cy.intercept("POST", "**/api/config/whitelist", {
      statusCode: 201,
      body: {
        status: "success",
        data: {
          _id: "wl_new_detail",
          channelId: id,
          channelName: name,
          note: note,
        },
      },
    }).as("addWhitelistDetail");
    cy.get('input[name="channelId"]').clear().type(id);
    cy.contains("button", "Isi Detail Opsional").click();
    cy.get('input[name="channelName"]').type(name);
    cy.get('input[name="note"]').type(note);
    cy.contains("button", "Tambah").click();
    cy.wait("@addWhitelistDetail");
  },
);

When(
  "User attempts to add a duplicate {string} to whitelist",
  (channelInput) => {
    cy.intercept("POST", "**/api/config/whitelist", {
      statusCode: 409,
      body: {
        status: "error",
        message: "Channel ini sudah ada di whitelist Anda.",
      },
    }).as("postDuplicateWhitelist");

    cy.get('input[name="channelId"]').clear().type(channelInput);
    cy.contains("button", "Tambah").click();
    cy.wait("@postDuplicateWhitelist");
  },
);

When("User submits an empty input for whitelist", () => {
  cy.get('input[name="channelId"]').clear();
});

When("User deletes {string} from whitelist", (channelName) => {
  cy.intercept("DELETE", "**/api/config/whitelist/*", {
    statusCode: 204,
    body: {},
  }).as("deleteWhitelist");

  cy.contains(channelName)
    .parents('div[class*="group flex"]')
    .find("button[title='Hapus dari whitelist']")
    .click({ force: true });
  cy.wait("@deleteWhitelist");
});

Then("System displays {string} in the whitelist table", (text) => {
  cy.contains(text).should("be.visible");
});

Then(
  "The whitelist item {string} contains note {string}",
  (itemId, noteText) => {
    cy.contains(itemId)
      .parents('div[name="whitelist-item"]')
      .should("contain", noteText);
  },
);

Then("System displays a warning {string}", (message) => {
  cy.contains(message, { matchCase: false }).should("be.visible");
});

Then("System prevents submission and disables the add button", () => {
  cy.get('input[name="channelId"]').should("have.value", "");
  cy.contains("button", "Tambah").should("be.disabled");
});

Then("System removes {string} from the whitelist table", (channelName) => {
  cy.contains(channelName).should("not.exist");
});

// ===== Blacklist Steps =====
Given("The blacklist table contains {string}", (keyword) => {
  cy.contains("span", keyword).should("be.visible");
});

When("User adds {string} to blacklist", (keyword) => {
  cy.intercept("POST", "**/api/config/blacklist", {
    statusCode: 201,
    body: {
      status: "success",
      data: {
        added: [keyword],
        skipped_default: [],
        skipped_duplicate: [],
      },
    },
  }).as("addBlacklist");
  cy.intercept("GET", "**/api/config/blacklist", {
    statusCode: 200,
    body: {
      status: "success",
      count: 2,
      data: [
        { _id: "bl_456", keyword: "zeus" },
        { _id: "bl_new", keyword: keyword },
      ],
    },
  }).as("getBlacklistUpdated");
  cy.get('input[name="keyword"]')
    .clear()
    .type(keyword)
    .should("have.value", keyword);
  cy.get('input[name="keyword"]').type("{enter}");
  cy.wait("@addBlacklist");
  cy.wait("@getBlacklistUpdated");
});

When("User deletes {string} from blacklist", (keyword) => {
  cy.intercept("DELETE", "**/api/config/blacklist/*", {
    statusCode: 204,
    body: {},
  }).as("deleteBlacklist");
  cy.contains("span", keyword).parent().find("button").click();
  cy.wait("@deleteBlacklist");
});

When(
  "User types {string} in the blacklist input and presses Enter",
  (keyword) => {
    cy.intercept("POST", "**/api/config/blacklist", {
      statusCode: 409,
      body: { status: "error", message: "Kata kunci sudah ada di daftar" },
    }).as("postDuplicate");
    cy.get('input[name="keyword"]').clear().type(`${keyword}{enter}`);
  },
);

Then("System displays {string} in the blacklist table", (keyword) => {
  cy.contains("span", keyword).should("be.visible");
});

Then("System removes {string} from the blacklist table", (keyword) => {
  cy.contains("span", keyword).should("not.exist");
});

Then("System rejects the input and displays a warning {string}", (message) => {
  cy.wait("@postDuplicate");
  cy.contains(message, { matchCase: false }).should("be.visible");
});
