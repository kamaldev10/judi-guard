import { Given, When } from "@badeball/cypress-cucumber-preprocessor";

Given("User is logged in", () => {
  cy.fixture("member_unconnected.json").then((authData) => {
    cy.intercept("GET", "**/api/**/me", {
      statusCode: 200,
      body: authData.judiGuardUser,
    }).as("getUserProfileUnconnected");
    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("judiGuardToken", authData.judiGuardToken);
        win.localStorage.setItem(
          "judiGuardUser",
          JSON.stringify(authData.judiGuardUser),
        );
      },
    });
    cy.wait("@getUserProfileUnconnected");
    cy.contains(authData.judiGuardUser.username).should("be.visible");
    cy.contains("Hubungkan YouTube").should("be.visible");
  });
});

Given("User is connected with his Youtube Account", () => {
  cy.fixture("member_connected.json").then((authData) => {
    cy.fixture("auth_guest.json").then((guestData) => {
      cy.intercept("GET", "**/api/**/me", {
        statusCode: 200,
        body: authData.judiGuardUser,
      });
      cy.intercept("GET", "**/auth/youtube/profile", {
        statusCode: 200,
        body: {
          data: guestData.channel,
        },
      }).as("getYoutubeProfile");
      cy.setCookie("guest_session", JSON.stringify(guestData));
      cy.visit("/dashboard", {
        onBeforeLoad(win) {
          win.localStorage.setItem("judiGuardToken", authData.judiGuardToken);
          win.localStorage.setItem(
            "judiGuardUser",
            JSON.stringify(authData.judiGuardUser),
          );
        },
      });
      cy.wait("@getYoutubeProfile");
      cy.contains("Ali Musthafa Kamal").should("be.visible");
      cy.contains("Connected").should("be.visible");
    });
  });
});

Given("Analysis results are available", () => {
  cy.intercept("GET", "**/api/analysis/results", {
    fixture: "analysis_result.json",
  }).as("getAnalysisResults");
  cy.visit("/analysis/result");
  cy.wait("@getAnalysisResults");
});
