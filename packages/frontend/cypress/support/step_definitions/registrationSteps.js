import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let regData;

beforeEach(() => {
  cy.fixture("registrationData").then((data) => {
    regData = data;
  });
});

Given("I am on the registration page", () => {
  cy.intercept("POST", "**/api/v1/auth/register", (req) => {
    const { email, username } = req.body;

    if (email === regData.existingEmailUser.email) {
      req.reply({
        statusCode: 409,
        body: { message: regData.responses.emailConflict.message },
      });
    } else if (username === regData.existingUsernameUser.username) {
      req.reply({
        statusCode: 409,
        body: { message: regData.responses.usernameConflict.message },
      });
    } else {
      req.reply({
        statusCode: 201,
        body: {
          message: regData.responses.registerSuccess.message,
          user: { email, username },
        },
      });
    }
  }).as("registerApi");

  cy.visit("/register");
});

Given("a valid OTP code has been sent to {string}", (email) => {
  cy.intercept("POST", "**/api/v1/auth/verify-otp", (req) => {
    const { otpCode } = req.body;

    if (otpCode === regData.otp.invalidCode) {
      req.reply({
        statusCode: 400,
        body: { message: regData.responses.otpFailure.message },
      });
    } else {
      req.reply({
        statusCode: 200,
        body: {
          message: regData.responses.otpSuccess.message,
          token: regData.responses.otpSuccess.token,
          user: {
            id: "123",
            email: email,
            username: "testuser",
            isVerified: true,
          },
        },
      });
    }
  }).as("verifyOtpApi");

  cy.intercept("POST", "**/api/v1/auth/resend-otp", (req) => {
    const targetEmail = req.body.email || email;
    req.reply({
      statusCode: 200,

      body: { message: regData.responses.resendSuccess.message },
    });
  }).as("resendOtpApi");
});

When("I enter the valid OTP", () => {
  const validOtp = regData.otp.validCode;

  cy.get('[data-cy^="otp-input-"]').each(($el, index) => {
    cy.wrap($el).type(validOtp[index]);
  });
});

When("I enter {string} as the OTP", (otp) => {
  cy.get('[data-cy^="otp-input-"]').each(($el, index) => {
    if (otp[index]) {
      cy.wrap($el).type(otp[index]);
    }
  });
});

Given("the OTP resend timer has expired", () => {
  const now = new Date().getTime();
  cy.clock(now);

  cy.getBySel("otp-timer", { timeout: 60000 }).should("be.visible");

  cy.tick(122000);
});

Then("the OTP resend timer should restart", () => {
  cy.getBySel("otp-timer").should("be.visible");
  cy.getBySel("resend-button").should("not.exist");
});
