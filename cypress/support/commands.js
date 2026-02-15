Cypress.Commands.add("getBySel", (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add("getBySelLike", (selector, ...args) => {
  return cy.get(`[data-cy*=${selector}]`, ...args);
});

Cypress.Commands.add("login", (email, password) => {
  const user = {
    _id: "mock-user-id-123",
    id: "mock-user-id-123",
    email: email,
    username: "Admin Tester",
    name: "Admin Tester",
    isVerified: true,
    isYoutubeConnected: false,
    createdAt: new Date().toISOString(),
  };

  const token = "mock-jwt-token-valid-123";

  window.localStorage.setItem("judiGuardToken", token);
  window.localStorage.setItem("judiGuardUser", JSON.stringify(user));

  cy.log(`Login Programatik: ${email}`);
});
