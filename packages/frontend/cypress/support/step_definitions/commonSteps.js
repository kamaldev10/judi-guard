import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let authData;

// Load fixture data sebelum setiap tes
beforeEach(() => {
  cy.fixture("authData").then((data) => {
    authData = data;
  });
});

// === SHARED GIVEN (Setup & Login) ===

Given("I am logged in as {string}", (email) => {
  const password =
    email === authData?.validUser?.email
      ? authData.validUser.password
      : "Admin123";

  cy.login(email, password);
});

Given("I am a guest", () => {
  cy.clearAllLocalStorage();
  cy.clearCookies();
});

// === SHARED 'WHEN' STEPS ===

When("I enter {string} into the {string} field", (text, fieldName) => {
  const selector = `${fieldName.toLowerCase().replace(/\s+/g, "-")}-input`;
  let textToType = text;

  if (text === "[SPACE]") {
    textToType = " ";
  } else if (text === "[EMPTY]") {
    textToType = "";
  }

  cy.getBySel(selector)
    .should("be.visible")
    .then(($input) => {
      $input.closest("form").attr("novalidate", "novalidate");
      return $input;
    })
    .clear()
    .then(($input) => {
      if (textToType !== "") {
        const shouldLog = !fieldName.toLowerCase().includes("password");
        cy.wrap($input).type(textToType, { log: shouldLog });
      }
    });
});

When("I press the {string} button", (buttonName) => {
  const selector = `${buttonName.toLowerCase().replace(/\s+/g, "-")}-button`;
  cy.getBySel(selector).click();
});

When("I try to navigate directly to the {string} page", (pagePath) => {
  const cleanPath = pagePath.split(" ")[0];
  cy.visit(cleanPath, { failOnStatusCode: false });
});

When("I scroll to the {string} section", (sectionName) => {
  const selector = `#${sectionName.toLowerCase().replace(/\s+/g, "-")}`;
  cy.get(selector).scrollIntoView();
});

When("I confirm the action in the popup", () => {
  cy.get(".swal2-confirm").should("be.visible").click();
});

When("I cancel the action in the popup", () => {
  cy.get(".swal2-cancel").should("be.visible").click();
});

// === SHARED 'THEN' STEPS ===

Then("I should be redirected to the {string} page", (pagePath) => {
  const path = pagePath === "/" ? "/" : pagePath.toLowerCase();
  cy.location("pathname", { timeout: 10000 }).should("eq", path);
});

Then("I should remain on the {string} page", (pagePath) => {
  cy.location("pathname").should("include", pagePath.toLowerCase());
});

Then("I should see a loading notification", () => {
  cy.get(".Toastify").should("exist");
  cy.get(".Toastify__spinner").should("be.visible");
});

Then(
  "I should see a loading notification with the text {string}",
  (message) => {
    cy.get(".Toastify").within(() => {
      cy.contains(message).should("be.visible");
      cy.get(".Toastify__spinner").should("exist");
    });
  }
);

Then(
  "I should see a success notification with the text {string}",
  (message) => {
    cy.get(".Toastify", { timeout: 10000 }).should("exist");
    cy.get(".Toastify").within(() => {
      cy.contains(message).should("be.visible");
    });
  }
);

Then("I should see an error notification with the text {string}", (message) => {
  cy.contains(message, { matchCase: false }).should("be.visible");
});

Then("I should see a success popup with the text {string}", (message) => {
  cy.get(".swal2-popup").should("be.visible");
  cy.get(".swal2-icon.swal2-success").should("be.visible");
  cy.get("#swal2-html-container").should("contain", message);
});

Then("I should see an error popup with the text {string}", (message) => {
  cy.get(".swal2-popup").should("be.visible");
  cy.get(".swal2-icon.swal2-error").should("be.visible");
  cy.get("#swal2-html-container").should("contain", message);
});

Then("I should see a warning popup with the text {string}", (message) => {
  cy.get(".swal2-popup").should("be.visible");
  cy.get(".swal2-icon.swal2-warning").should("be.visible");
});

Then("I should see an info popup with the text {string}", (message) => {
  cy.get(".swal2-popup").should("be.visible");
  cy.get(".swal2-icon.swal2-info").should("be.visible");
  cy.get("#swal2-html-container").should("contain", message);
});

Then("I should see a loading popup", () => {
  cy.get(".swal2-popup").should("be.visible");
  cy.get(".swal2-loader").should("exist").and("be.visible");
});

Then("I should see a popup title {string}", (title) => {
  cy.get("#swal2-title").should("be.visible").and("have.text", title);
});

Then("I close the popup", () => {
  cy.get(".swal2-confirm").should("be.visible").click();
});

Then(
  "I should see a validation error message containing {string}",
  (message) => {
    cy.contains(message).should("be.visible");
  }
);

Then("I should see {string} on the page", (text) => {
  cy.contains(text).should("be.visible");
});

Then("I should be logged out", () => {
  cy.window().then((window) => {
    expect(window.localStorage.getItem("judiGuardToken")).to.be.null;
  });
  cy.location("pathname").should("include", "/login");
});

Then("I should not be logged out", () => {
  cy.window().then((window) => {
    expect(window.localStorage.getItem("judiGuardToken"));
  });
});

Then("I should see the restricted access view", () => {
  cy.get('img[alt="Not Login Image"]').should("be.visible");
});

Then("I should see a heading with the text {string}", (text) => {
  cy.get("h1, h2, h3, h4, h5, h6").contains(text).should("be.visible");
});

Then("I should see a message with the text {string}", (text) => {
  cy.contains(text).should("be.visible");
});
