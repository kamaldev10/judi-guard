@login
Feature: User Login
  As a User,
  I want to log in to the system using my account,
  So that I can access all application features.

  Background:
    Given I am on the login page

  @success
  Scenario: User logs in successfully with valid credentials
    When I enter "admin@gmail.com" into the "email" field
    And I enter "Admin123" into the "password" field
    And I press the "Log in" button
    Then I should be redirected to the "/" page
    And I should see a success notification with the text "Anda berhasil login!"
    And I should see my username in the header

  @google @success
  Scenario: User logs in successfully with Google
    Given I am prepared to successfully authenticate with Google
    When I press the Google "Log In with Google" button
    Then I should see a success notification with the text "Login dengan Google berhasil!"
    And I should be redirected to the "/" page from Google

  @failure
  Scenario Outline: User fails to log in with invalid data
    When I enter "<email>" into the "email" field
    And I enter "<password>" into the "password" field
    And I press the "Log in" button
    Then I should see an error notification with the text "<error_message>"
    And I should remain on the "/login" page

    Examples:
      | email               | password       | error_message               |
      | unknown@example.com | Admin123       | Error: Akun belum terdaftar |
      | admin@gmail.com     | wrong-password | Error: Password Anda salah  |
