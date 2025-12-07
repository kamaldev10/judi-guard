import "./commands";
// import "cypress-mochawesome-reporter/register";
// Bisa juga setup global hooks di sini (beforeEach, dll)

// Logging tambahan
Cypress.on("uncaught:exception", (err) => {
  console.error("Uncaught Exception:", err);
  return false;
});
