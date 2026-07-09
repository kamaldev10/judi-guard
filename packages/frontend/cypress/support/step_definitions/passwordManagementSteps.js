import { Given, When, Before } from '@badeball/cypress-cucumber-preprocessor';

let authData;

beforeEach(() => {
  cy.fixture('authData').then((data) => {
    authData = data;
  });
});

// --- FORGOT PASSWORD STEPS ---
Given('I visit the login page to request a password reset', () => {
  cy.intercept('POST', '**/api/auth/forgot-password', (req) => {
    req.reply({
      statusCode: 200,
      body: { message: authData.messages.forgotPasswordSuccess },
    });
  }).as('forgotPasswordApi');

  cy.visit('/login');
});

When('I click the Forgot Password link', () => {
  cy.getBySel('forgot-password-link').should('be.visible').click();
  cy.visit('/forgot-password');
});

// --- RESET PASSWORD STEPS ---
Given('I visit the reset password page with a valid token', () => {
  const token = authData.validResetToken;

  cy.intercept('PUT', `**/api/auth/reset-password/${token}`, (req) => {
    req.reply({
      statusCode: 200,
      body: { message: authData.messages.resetPasswordSuccess },
    });
  }).as('resetPasswordApi');

  cy.visit(`/reset-password/${token}`);
});

// --- CHANGE PASSWORD STEPS ---
Before({ tags: '@change_password' }, () => {
  cy.fixture('authData').then((data) => {
    cy.intercept('PATCH', '**/api/auth/change-password', (req) => {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (currentPassword !== data.validUser.password) {
        req.reply({
          statusCode: 400,
          body: { message: data.messages.currentPasswordError },
        });
      } else if (newPassword.length < 8) {
        req.reply({
          statusCode: 400,
          body: { message: data.messages.passwordShortError },
        });
      } else if (newPassword !== confirmPassword) {
        req.reply({
          statusCode: 400,
          body: { message: data.messages.passwordMismatchError },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { message: data.messages.changePasswordSuccess },
        });
      }
    }).as('changePasswordApi');
  });
});

Given('I am on the change password page', () => {
  cy.visit('/change-password');
});
