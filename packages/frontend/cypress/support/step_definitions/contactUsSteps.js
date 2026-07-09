import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwkwjgk';

Given('I am at the contact section of the homepage', () => {
  cy.intercept('POST', FORMSPREE_ENDPOINT, (req) => {
    console.log('Intercepted Formspree Body:', req.body);

    let body = req.body || {};
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    req.reply({
      statusCode: 200,
      body: { ok: true, next: '/thanks' },
      delay: 500,
    });
  }).as('formspreeSubmit');

  cy.visit('/');
  cy.get('#contact-section').scrollIntoView();
});

Given('the contact form submission will fail', () => {
  cy.intercept('POST', FORMSPREE_ENDPOINT, {
    statusCode: 500,
    body: { error: 'Gagal mengirim pesan' },
  }).as('formspreeSubmit');
});

Then('I should see the {string} button in a submitting state', (buttonName) => {
  cy.getBySel('contact-submit-button').should('be.disabled').and('contain', 'Mengirim...');

  cy.wait('@formspreeSubmit');

  cy.wait(200);
});

Then('the {string} field should be empty', (fieldName) => {
  const selector = `${fieldName.toLowerCase()}-input`;

  cy.getBySel(selector).should('have.value', '');
});

Then('the {string} field should not be empty', (fieldName) => {
  const selector = `${fieldName.toLowerCase()}-input`;

  cy.getBySel(selector).should('not.have.value', '');
});
