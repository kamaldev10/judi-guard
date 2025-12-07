import { Given, When, Before } from "@badeball/cypress-cucumber-preprocessor";

let authData;

beforeEach(() => {
  cy.fixture("authData").then((data) => {
    authData = data;
  });
});

const createMockUserResponse = (userData) => ({
  statusCode: 200,
  body: {
    status: "success",
    data: {
      user: {
        id: "mock-id-123",
        email: userData.email,
        username: userData.username || "admin ganteng",
        isVerified: true,
      },
    },
  },
});

Before({ tags: "@edit_profile" }, () => {
  cy.fixture("authData").then((data) => {
    cy.intercept(
      "GET",
      "**/api/v1/users/me",
      createMockUserResponse(data.validUser)
    ).as("getUser");

    cy.intercept("PATCH", "**/api/v1/users/updateMe", (req) => {
      const { username } = req.body;

      if (username === "my-new-username") {
        req.reply({
          statusCode: 200,
          body: {
            status: "success",
            message: "Data profil Anda telah berhasil diperbarui.",
            data: {
              user: {
                ...data.validUser,
                username: "my-new-username",
              },
            },
          },
        });
      } else if (username === "error-user") {
        req.reply({
          statusCode: 500,
          body: { message: "Gagal memperbarui profil." },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { status: "success", data: { user: { ...data.validUser } } },
        });
      }
    }).as("updateProfileApi");
  });
});

Before({ tags: "@delete_account" }, () => {
  cy.fixture("authData").then((data) => {
    cy.intercept(
      "GET",
      "**/api/v1/users/me",
      createMockUserResponse(data.validUser)
    ).as("getUser");
  });

  cy.intercept("DELETE", "**/api/v1/users/deleteMe", {
    statusCode: 200,
    body: { status: "success", message: "Akun Anda telah berhasil dihapus." },
  }).as("deleteAccountApi");
});

Given("I am on the profile page", () => {
  const mockResponse = createMockUserResponse(authData.validUser);

  cy.intercept("GET", "**/api/v1/users/me", mockResponse).as("getUser");

  cy.visit("/profile");

  cy.getBySel("edit-profile-button").should("be.visible");
});

When("I press the Save Profile button without making any changes", () => {
  cy.getBySel("save-profile-button").click();
});
