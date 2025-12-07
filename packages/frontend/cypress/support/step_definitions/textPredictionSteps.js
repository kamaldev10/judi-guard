import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let predictionData;

beforeEach(() => {
  cy.fixture("textPredictionData").then((data) => {
    predictionData = data;
  });
});

Given("I am at the text prediction section of the homepage", () => {
  cy.intercept("POST", "**/api/v1/text/predict", (req) => {
    const { text } = req.body;

    if (!text) {
      req.reply({
        statusCode: 400,
        body: {
          message:
            "⚠️ Tidak ada teks yang diprediksi. Silahkan masukkan teks Anda.",
        },
      });
      return;
    }

    const matchedScenario = predictionData.scenarios.find((scenario) =>
      text.toLowerCase().includes(scenario.keyword.toLowerCase())
    );

    if (matchedScenario) {
      req.reply({
        statusCode: 200,
        body: {
          status: "success",
          data: {
            classification: matchedScenario.classification,
            confidenceScore: matchedScenario.confidenceScore,
            modelVersion: matchedScenario.modelVersion,
          },
        },
      });
    } else {
      req.reply({
        statusCode: 200,
        body: {
          status: "success",
          data: predictionData.defaultResponse,
        },
      });
    }
  }).as("predictTextApi");

  cy.visit("/");

  cy.get("#text-predict-section").scrollIntoView();
});

Given("the prediction system is unavailable", () => {
  cy.intercept("POST", "**/api/v1/text/predict", {
    statusCode: 500,
    body: { message: predictionData.errorResponse.message },
  }).as("predictTextApi");
});

Then(
  "I should see the classification result was {string}",
  (classification) => {
    cy.getBySel("prediction-result-container").within(() => {
      cy.contains(classification).should("be.visible");
    });
  }
);

Then("I should see the confidence score was {string}", (scoreText) => {
  cy.getBySel("prediction-result-container").within(() => {
    cy.contains(scoreText).should("be.visible");
  });
});

Then("the prediction API should not be called", () => {
  cy.wait(500);
  cy.get("@predictTextApi.all").should("have.length", 0);
});

Then("I should not see a classification result", () => {
  cy.getBySel("prediction-result-container").should("not.exist");
});
