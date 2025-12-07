import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let videoData;
const ANALYSIS_API_URL = "**/api/v1/analysis/videos";
const MOCK_ANALYSIS_ID = "mock-analysis-id-123";

// Load fixture sebelum tes berjalan
beforeEach(() => {
  cy.fixture("videoAnalysisData").then((data) => {
    videoData = data;
  });
});

Given("I am on the video analysis page", () => {
  cy.visit("/analysis");

  cy.intercept("POST", ANALYSIS_API_URL, (req) => {
    const { videoUrl } = req.body;
    console.log("[Intercept] Submit Analysis untuk URL:", videoUrl);

    if (videoUrl.includes("notfound123")) {
      req.reply({
        statusCode: 404,
        body: { message: videoData.responses.notFoundError.message },
      });
    } else if (videoUrl.includes("fail123")) {
      req.reply({
        statusCode: 200,
        body: videoData.responses.initProcessing,
        delay: 500,
      });
    } else {
      req.reply({
        statusCode: 200,
        body: videoData.responses.initProcessing,
        delay: 1000,
      });
    }
  }).as("submitAnalysisApi");
});

// Mock User TERHUBUNG dengan YouTube
Given("my YouTube account is connected", () => {
  cy.intercept("GET", "**/api/v1/users/me", {
    statusCode: 200,
    body: {
      status: "success",
      data: {
        user: {
          id: "user-123",
          email: "admin@gmail.com",
          username: "Admin Ganteng",
          isVerified: true,
          youtubeChannelId: "UC_MOCK_CHANNEL_ID",
          youtubeChannelName: "Admin Channel",
        },
      },
    },
  }).as("getUserConnected");

  cy.window().then((win) => {
    const userStr = win.localStorage.getItem("judiGuardUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      user.youtubeChannelId = "UC_MOCK_CHANNEL_ID"; // Inject ID
      win.localStorage.setItem("judiGuardUser", JSON.stringify(user));
    }
  });

  cy.reload();
});

Given("my YouTube account is NOT connected", () => {
  cy.intercept("GET", "**/api/v1/users/me", {
    statusCode: 200,
    body: {
      status: "success",
      data: {
        user: {
          id: "user-123",
          email: "admin@gmail.com",
          username: "Admin Ganteng",
          isVerified: true,
          youtubeChannelId: null,
        },
      },
    },
  }).as("getUserNotConnected");

  cy.window().then((win) => {
    const userStr = win.localStorage.getItem("judiGuardUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      user.youtubeChannelId = null; // Hapus ID
      win.localStorage.setItem("judiGuardUser", JSON.stringify(user));
    }
  });

  cy.reload();
});

When('the analysis status changes to "COMPLETED"', () => {
  cy.intercept("GET", `${ANALYSIS_API_URL}/${MOCK_ANALYSIS_ID}`, {
    statusCode: 200,
    body: videoData.responses.completed,
  }).as("getAnalysisCompleted");

  cy.intercept("GET", `${ANALYSIS_API_URL}/${MOCK_ANALYSIS_ID}/comments`, {
    statusCode: 200,
    body: { status: "success", data: videoData.responses.comments },
  }).as("getComments");

  cy.wait("@getAnalysisCompleted", { timeout: 10000 });

  cy.wait("@getComments", { timeout: 10000 });
});

When("the analysis fails due to expired token", () => {
  cy.intercept("GET", `${ANALYSIS_API_URL}/${MOCK_ANALYSIS_ID}`, {
    statusCode: 401,
    body: {
      status: "fail",
      message:
        "UnauthorizedError: Gagal memperbarui sesi YouTube Anda. invalid_grant",
    },
  }).as("getAnalysisExpired");

  cy.wait("@getAnalysisExpired", { timeout: 10000 });
});

// Verifikasi API tidak dipanggil (Client Validation)
Then("the analysis API should not be called", () => {
  cy.wait(500);
  cy.get("@submitAnalysisApi.all").should("have.length", 0);
});

// Verifikasi Summary (Pie Chart & Stats)
Then("I should see the analysis summary", () => {
  cy.contains("Total Komentar").should("be.visible");
  cy.contains("Komentar Judi").should("be.visible");
  cy.get(".recharts-wrapper").should("exist");
});

// Verifikasi Daftar Komentar
Then("I should see the list of analyzed comments", () => {
  cy.contains("Daftar Komentar").should("be.visible");

  if (videoData?.responses?.comments?.length > 0) {
    cy.contains(videoData.responses.comments[0].commentTextDisplay).should(
      "be.visible"
    );
  }
});
