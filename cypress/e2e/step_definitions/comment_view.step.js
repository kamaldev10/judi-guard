import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("User is on the analysis page", () => {
  cy.intercept("GET", "**/api/videos*", { fixture: "video_list.json" }).as(
    "getVideoList",
  );
  cy.visit("/dashboard/analysis");
  cy.wait("@getVideoList");
  cy.contains("Upload Terbaru Channel Anda").should("be.visible"); // Sesuai Wireframe Gbr 4.16
  cy.get("[data-cy=video-grid-item]").should("have.length.at.least", 1);
});

When("User inputs a valid video link", () => {
  const videoId = "eeKxI45uZ0Y";
  const videoLink = `https://www.youtube.com/watch?v=${videoId}`;
  cy.fixture("search_result.json").then((searchData) => {
    cy.intercept("GET", "**/api/videos/search*", {
      statusCode: 200,
      body: {
        status: "success",
        data: searchData,
      },
    }).as("searchVideo");
  });

  cy.fixture("comment_list.json").then((commentsArray) => {
    cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
      statusCode: 200,
      body: {
        status: "success",
        data: {
          comments: commentsArray,
          nextPageToken: null,
        },
      },
    }).as("getComments");
  });
  cy.get("[data-cy=input-video-link]").clear().type(videoLink);
  cy.get("[data-cy=btn-search]").click();
  cy.wait("@searchVideo", { timeout: 10000 });
  cy.wait("@getComments", { timeout: 10000 });
});

Then("System displays the list of comments from the video", () => {
  cy.get("[data-cy=comment-list-section]").should("be.visible");
  cy.get("[data-cy=comment-item]").should("have.length.at.least", 2);
  cy.contains("Konten yang sangat bermanfaat").should("be.visible");
  cy.contains("situs gacor").should("be.visible");
  cy.contains("Mampir kakak").should("be.visible");
});
