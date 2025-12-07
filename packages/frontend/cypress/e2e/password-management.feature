@password
Feature: Password Management
    As a User,
    I want to manage my account password (forgot/reset/change),
    So that I can keep my account secure.

    @forgot_password  @success
    Scenario: Guest successfully requests a password reset
        Given I visit the login page to request a password reset
        When I click the Forgot Password link
        Then I should be redirected to the "/forgot-password" page

        When I enter "admin@gmail.com" into the "email" field
        And I press the "Send Instructions" button
        Then I should see a popup title "Permintaan Terkirim!"
        And I should see a success popup with the text "Kami telah mengirim email berisi instruksi untuk mereset kata sandi Anda. Periksa folder inbox dan spam Anda."
        And I close the popup

    @forgot_password @failure
    Scenario: Guest fails to request password reset
        Given I visit the login page to request a password reset
        When I click the Forgot Password link

        When I enter "[EMPTY]" into the "email" field
        And I press the "Send Instructions" button

        Then I should see a warning popup with the text "Alamat email wajib diisi."
        And I should remain on the "/forgot-password" page

    @reset_password  @success
    Scenario: Guest successfully resets their password using a valid token
        Given I visit the reset password page with a valid token
        When I enter "NewValidPass123" into the "new password" field
        And I enter "NewValidPass123" into the "confirm password" field
        And I press the "Reset Password" button
        Then I should see a success notification with the text "Kata sandi berhasil direset"


    @change_password @success
    Scenario: User successfully changes their password
        Given I am logged in as "admin@gmail.com"
        And I am on the change password page

        When I enter "Admin123" into the "current password" field
        And I enter "NewValidPass123" into the "new password" field
        And I enter "NewValidPass123" into the "confirm password" field
        And I press the "Change Password" button

        Then I should see a success notification with the text "Berhasil! Silakan login kembali"
        And I should be redirected to the "/login" page
        And I should be logged out

    @change_password @failure
    Scenario Outline: User fails to change password with invalid data
        Given I am logged in as "admin@gmail.com"
        And I am on the change password page

        When I enter "<current_pass>" into the "current password" field
        And I enter "<new_pass>" into the "new password" field
        And I enter "<confirm_pass>" into the "confirm password" field
        And I press the "Change Password" button

        Then I should see an error notification with the text "<error_message>"
        And I should remain on the "/change-password" page

        Examples:
            | current_pass | new_pass   | confirm_pass    | error_message                                         |
            | WrongPass123 | NewPass123 | NewPass123      | Kata sandi saat ini salah                             |
            | Admin123     | NewPass123 | MismatchPass123 | Kata sandi baru dan konfirmasi kata sandi tidak cocok |
            | Admin123     | short      | short           | Kata sandi baru harus minimal 8 karakter              |