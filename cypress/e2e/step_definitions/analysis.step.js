import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("User is on the analysis selection page", () => {
  cy.intercept("GET", "**/api/videos*", { fixture: "video_list.json" }).as(
    "getMyVideos",
  );
  cy.visit("/dashboard/analysis");
  cy.wait("@getMyVideos");
  cy.contains("Pilih Video untuk Dianalisis").should("be.visible");
});

Given("Analysis results are available for {string}", (videoId) => {
  cy.intercept("GET", "**/api/videos*", {
    fixture: "video_list.json",
  });
  cy.fixture("search_result.json").then((searchData) => {
    cy.intercept("GET", "**/api/videos/search*", {
      body: { status: "success", data: searchData },
    });
  });
  cy.fixture("comment_list.json").then((commentsArr) => {
    cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
      body: {
        status: "success",
        data: { comments: commentsArr, nextPageToken: null },
      },
    });
  });
  cy.intercept("POST", "**/api/analysis/*", {
    fixture: "analysis_start.json",
  });
  cy.intercept("GET", "**/api/analysis/status/*", {
    fixture: "status_completed.json",
  });
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "analysis_result.json",
  }).as("getResults");
  cy.visit("/dashboard/analysis");
  cy.get('[data-cy="input-video-link"]').type(
    `https://youtube.com/watch?v=${videoId}`,
  );
  cy.get('[data-cy="btn-search"]').click();
  cy.contains("button", "Mulai Analisis AI").click();
  cy.wait("@getResults");
  cy.contains("Hasil Analisis Video").should("be.visible");
});

When("Each comment displays a confidence score", () => {
  cy.contains("AI:").should("be.visible");
  cy.contains("%").should("be.visible");
});

When("User selects the filter for {string}", (filterLabel) => {
  const riskMap = {
    "HIGH Risk": "HIGH",
    "MEDIUM Risk": "MEDIUM",
    "LOW Risk": "LOW",
  };
  const targetLevel = riskMap[filterLabel];
  cy.fixture("analysis_result.json").then((fullData) => {
    const filteredComments = fullData.data.comments.filter(
      (c) => c.riskLevel === targetLevel,
    );
    const filteredResponse = {
      status: "success",
      data: {
        ...fullData.data,
        comments: filteredComments,
        pagination: {
          ...fullData.data.pagination,
          totalItems: filteredComments.length,
          totalPages: 1,
        },
      },
    };
    cy.intercept("GET", `**/api/analysis/*/results*riskLevel=${targetLevel}*`, {
      statusCode: 200,
      body: filteredResponse,
    }).as("getFilteredResults");
  });
  cy.contains("button", filterLabel).click();
  cy.wait("@getFilteredResults");
});

When("User searches for a video with link {string}", (url) => {
  const videoId = "eeKxI45uZ0Y";
  cy.fixture("search_result.json").then((searchData) => {
    cy.intercept("GET", "**/api/videos/search*", {
      statusCode: 200,
      body: { status: "success", data: searchData },
    }).as("searchVideo");
  });
  cy.fixture("comment_list.json").then((commentsArr) => {
    cy.intercept("GET", `**/api/videos/${videoId}/comments*`, {
      statusCode: 200,
      body: {
        status: "success",
        data: { comments: commentsArr, nextPageToken: null },
      },
    }).as("getPreviewComments");
  });
  cy.get('[data-cy="input-video-link"]').clear().type(url);
  cy.get('[data-cy="btn-search"]').click();
  cy.wait("@searchVideo");
  cy.wait("@getPreviewComments");
});

When("User initiates the analysis process from preview", () => {
  cy.intercept("POST", "**/api/analysis/*", {
    fixture: "analysis_start.json",
  }).as("startAnalysis");
  cy.intercept("GET", "**/api/analysis/status/*", {
    fixture: "status_processing.json",
  }).as("pollProcessing");
  cy.contains("button", "Mulai Analisis AI").click();
  cy.wait("@startAnalysis");
});

When("The analysis process completes", () => {
  cy.intercept("GET", "**/api/analysis/status/*", {
    fixture: "status_completed.json",
  }).as("pollCompleted");
  cy.intercept("GET", "**/api/analysis/*/results*", {
    fixture: "analysis_result.json",
  }).as("getResults");
  cy.wait("@pollCompleted", { timeout: 10000 });
});

When("User initiates the analysis process but server returns an error", () => {
  cy.intercept("POST", "**/api/analysis/*", {
    statusCode: 500,
    body: { status: "error", message: "Gagal memulai analisis" },
  }).as("startAnalysisError");

  cy.contains("button", "Mulai Analisis AI").click();
  cy.wait("@startAnalysisError");
});

When("The analysis process encounters an error", () => {
  cy.intercept("GET", "**/api/analysis/status/*", {
    statusCode: 200,
    body: {
      status: "success",
      data: {
        _id: "analysis_123_abc",
        status: "FAILED",
        message: "Analisis Gagal",
      },
    },
  }).as("pollFailed");

  cy.wait("@pollFailed", { timeout: 10000 });
});

When("User clicks the cancel button during scanning", () => {
  cy.intercept("GET", "**/api/analysis/status/*").as("polling");
  cy.contains("button", "Batalkan Proses").click();
});

When(
  "User selects the filter for {string} but no comments match",
  (filterLabel) => {
    const riskMap = {
      "HIGH Risk": "HIGH",
      "MEDIUM Risk": "MEDIUM",
      "LOW Risk": "LOW",
    };
    const targetLevel = riskMap[filterLabel];

    cy.intercept("GET", `**/api/analysis/*/results*riskLevel=${targetLevel}*`, {
      statusCode: 200,
      body: {
        status: "success",
        data: {
          comments: [],
          pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
        },
      },
    }).as("getEmptyFilteredResults");

    cy.contains("button", filterLabel).click();
    cy.wait("@getEmptyFilteredResults");
  },
);

Then("Each comment displays a risk label that are High, Medium, or Low", () => {
  cy.contains("TINGGI")
    .should("be.visible")
    .should("have.class", "text-red-700");
  cy.contains("RENDAH")
    .should("be.visible")
    .should("have.class", "text-yellow-700");
});

Then("System displays the detected keywords as analysis reasons", () => {
  cy.contains("gacor").should("be.visible");
  cy.contains("profit").should("be.visible");
  cy.contains("zeus").should("be.visible");
});

Then("System displays only comments matching {string} Risk", (riskLevel) => {
  if (riskLevel === "HIGH") {
    cy.contains("Spammer Fixture").should("be.visible");
    cy.contains("User Fixture 1").should("not.exist");
    cy.get('[data-cy="spam-label"]').each(($el) => {
      cy.wrap($el).should("contain", "TINGGI");
      cy.wrap($el).should("contain", "AI:");
      cy.wrap($el).should("contain", "%");
      cy.wrap($el).find("span").first().should("have.class", "bg-red-100");
    });
  }
});

Then("System displays the scanning progress screen", () => {
  cy.wait("@pollProcessing");
  cy.contains("h2", "Sedang Memindai Video").should("be.visible");
  cy.contains("Menganalisis dengan AI").should("be.visible");
  cy.get(".animate-ping").should("exist"); // Animasi radar
});

Then("System displays the analysis results page", () => {
  cy.wait("@getResults");
  cy.contains("h1", "Hasil Analisis Video").should("be.visible");
  cy.contains("Total Komentar").should("be.visible");
});

Then("System classifies comments as gambling spam or non-spam", () => {
  cy.contains("Spammer Fixture")
    .parents("tr")
    .within(() => {
      // cy.contains("JUDI").should("exist");
      cy.contains("TINGGI").should("exist");
    });
});

Then("System displays an error notification {string}", (errorMessage) => {
  cy.contains(errorMessage, { matchCase: false }).should("be.visible");
});

Then("System displays a failure message {string}", (failMessage) => {
  cy.contains(failMessage, { matchCase: false }).should("be.visible");
});

Then("System stops the scanning process", () => {
  cy.contains("button", "Mulai Analisis AI").should("be.visible");
  cy.contains("Preview Komentar Terbaru").should("be.visible");
});

Then("System displays the empty filter message {string}", (message) => {
  cy.contains(message, { matchCase: false }).should("be.visible");
});
