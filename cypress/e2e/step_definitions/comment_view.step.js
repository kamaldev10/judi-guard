import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("User is on the analysis page", () => {
  cy.intercept("GET", "**/api/videos*", { fixture: "video_list.json" }).as(
    "getVideoList",
  );
  cy.visit("/dashboard/analysis");
  cy.wait("@getVideoList");
  cy.contains("Upload Terbaru Channel Anda").should("be.visible");
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

When("User clicks on a video card from the recent uploads grid", () => {
  const videoId = "eeKxI45uZ0Y"; // Menggunakan ID dari fixture
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
    }).as("getCommentsFromGrid");
  });

  cy.get("[data-cy=video-grid-item]").first().click();
  cy.wait("@getCommentsFromGrid");
});

Then("System displays the list of comments from the video", () => {
  cy.get("[data-cy=comment-list-section]").should("be.visible");
  cy.get("[data-cy=comment-item]").should("have.length.at.least", 2);
  cy.contains("Konten yang sangat bermanfaat").should("be.visible");
  cy.contains("situs gacor").should("be.visible");
  cy.contains("Mampir kakak").should("be.visible");
});

When("User inputs an invalid video link {string}", (url) => {
  cy.intercept("GET", "**/api/videos/search*", {
    statusCode: 404,
    body: { status: "error", message: "Video tidak ditemukan" },
  }).as("searchInvalid");

  cy.get("[data-cy=input-video-link]").clear().type(url);
  cy.get("[data-cy=btn-search]").click();
  cy.wait("@searchInvalid");
});

When("User inputs a video link that has no comments", () => {
  const videoId = "emptyVideo123";
  const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

  cy.fixture("search_result.json").then((searchData) => {
    const customSearchData = { ...searchData, id: videoId };

    cy.intercept("GET", "**/api/videos/search*", {
      statusCode: 200,
      body: { status: "success", data: customSearchData },
    }).as("searchEmptyVideo");
  });

  cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
    statusCode: 200,
    body: {
      status: "success",
      data: { comments: [], nextPageToken: null },
    },
  }).as("getEmptyPreviewComments");

  cy.get("[data-cy=input-video-link]").clear().type(videoLink);
  cy.get("[data-cy=btn-search]").click();

  cy.wait("@searchEmptyVideo");
  cy.wait("@getEmptyPreviewComments");
});

When(
  "User is on the analysis page but no videos are found for the channel",
  () => {
    cy.intercept("GET", "**/api/videos*", {
      statusCode: 200,
      body: { status: "success", data: { videos: [], nextPageToken: null } },
    }).as("getEmptyVideos");

    cy.visit("/dashboard/analysis");
    cy.wait("@getEmptyVideos");
  },
);

When("User inputs a video link with disabled comments", () => {
  const videoId = "disabledCommentVid";
  cy.fixture("search_result.json").then((searchData) => {
    cy.intercept("GET", "**/api/videos/search*", {
      statusCode: 200,
      body: { status: "success", data: { ...searchData, id: videoId } },
    }).as("searchDisabledVid");
  });
  cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
    statusCode: 403,
    body: { status: "error", message: "Gagal memuat preview komentar." },
  }).as("getDisabledComments");

  cy.get("[data-cy=input-video-link]")
    .clear()
    .type(`https://youtube.com/watch?v=${videoId}`);
  cy.get("[data-cy=btn-search]").click();

  cy.wait("@searchDisabledVid");
  cy.wait("@getDisabledComments");
});

Then("System displays the list of comments from the selected video", () => {
  cy.get("[data-cy=comment-list-section]").should("be.visible");
  cy.contains("Konten yang sangat bermanfaat").should("be.visible");
});

Then("System displays an error message {string}", (message) => {
  cy.contains(message, { matchCase: false }).should("be.visible");
});

Then("System displays preview empty message {string}", (emptyMessage) => {
  cy.contains(emptyMessage, { matchCase: false }).should("be.visible");
});

Then("System displays the empty state message {string}", (msg) => {
  cy.contains(msg, { matchCase: false }).should("be.visible");
});

Then("System displays a {string} button", (btnText) => {
  cy.contains("button", btnText).should("be.visible");
});

Then("System displays a specific error message {string}", (errorMessage) => {
  cy.contains(errorMessage, { matchCase: false }).should("be.visible");
});
