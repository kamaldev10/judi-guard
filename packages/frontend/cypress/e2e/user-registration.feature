@registration
Feature: User Registration
  As a Guest,
  I want to create a new account,
  So that I can log in and access all application features.

  Background:
    Given I am on the registration page

  @success
  Scenario: Guest successfully registers and verifies with valid data
    # Part 1: Registration
    When I enter "new_user" into the "username" field
    And I enter "new_user@example.com" into the "email" field
    And I enter "ValidPassword123" into the "password" field
    And I press the "Register" button
    Then I should be redirected to the "/otp" page

    Given a valid OTP code has been sent to "new_user@example.com"
    When I enter the valid OTP
    And I press the "Verify" button
    Then I should see a success notification with the text "Verifikasi OTP berhasil!"
    And I should be redirected to the "/login" page

  @failure @registration_form
  Scenario Outline: Guest fails to register with invalid or duplicate data
    When I enter "<username>" into the "username" field
    And I enter "<email>" into the "email" field
    And I enter "<password>" into the "password" field
    And I press the "Register" button
    Then I should see an error notification with the text "<error_message>"
    And I should remain on the "/register" page

    Examples:
      | username  | email              | password         | error_message                                            |
      | adminbaru | admin@gmail.com    | Admin123         | Email sudah terdaftar, Silahkan login                    |
      | admin2    | admin312@gmail.com | Admin123         | Username sudah digunakan. Silakah gunakan username lain. |
      | new_user  | new@example.com    | [EMPTY]          | Password tidak boleh kosong.                             |
      | [EMPTY]   | new@example.com    | ValidPassword123 | Username tidak boleh kosong.                             |

  @failure @otp
  Scenario: User fails to verify with an invalid OTP
    When I enter "otp_fail_user" into the "username" field
    And I enter "otp_fail@example.com" into the "email" field
    And I enter "ValidPassword123" into the "password" field
    And I press the "Register" button
    Then I should be redirected to the "/otp" page
    And a valid OTP code has been sent to "otp_fail@example.com"

    When I enter "654321" as the OTP
    And I press the "Verify" button
    Then I should see an error notification with the text "Kode OTP salah."
    And I should remain on the "/otp" page

  @resend @otp
  Scenario: User resends the OTP after the timer expires
    When I enter "resend_user" into the "username" field
    And I enter "resend@example.com" into the "email" field
    And I enter "ValidPassword123" into the "password" field
    And I press the "Register" button
    Then I should be redirected to the "/otp" page
    And a valid OTP code has been sent to "resend@example.com"


    Given the OTP resend timer has expired
    When I press the "Resend" button
    Then I should see a success notification with the text "Kode OTP baru telah dikirim ke email Anda."
    And the OTP resend timer should restart