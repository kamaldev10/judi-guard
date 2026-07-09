import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.intercept('POST', '**/api/auth/login', (req) => {
    if (req.body.email === 'unknown@example.com') {
      req.reply({
        statusCode: 404,
        body: { message: 'Error: Akun belum terdaftar' },
      });
    } else if (req.body.password === 'wrong-password') {
      req.reply({
        statusCode: 401,
        body: { message: 'Error: Password Anda salah' },
      });
    } else {
      req.reply({ statusCode: 200, fixture: 'loginSuccess.json' });
    }
  }).as('loginRequest');

  cy.visit('/login');
});

// Mock untuk Google Login sukses.
Given('I am prepared to successfully authenticate with Google', () => {
  cy.intercept('POST', '**/api/auth/google/signin', {
    fixture: 'googleLoginSuccess.json',
  }).as('googleLoginRequest');

  cy.window().then((win) => {
    cy.stub(win, 'open').as('windowOpen');
  });
});

When('I press the Google {string} button', (btnText) => {
  if (btnText.toLowerCase().includes('google')) {
    cy.get('[data-cy="google-login-mock-btn"]').click({ force: true });
  } else {
    cy.contains('button', btnText, { matchCase: false }).click();
  }
});

Then('I should be redirected to the {string} page from Google', (path) => {
  cy.wait('@googleLoginRequest').then((interception) => {
    expect(interception.response.statusCode).to.equal(200);
  });

  cy.location('pathname').should('eq', path);
});

Then('I should see my username in the header', () => {
  cy.getBySel('user-profile-name', { timeout: 10000 })
    .should('be.visible')
    .and('contain', 'admin ganteng');
});
