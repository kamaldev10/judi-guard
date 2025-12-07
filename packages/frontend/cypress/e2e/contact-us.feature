@contact
Feature: Contact Us Form
    As a guest,
    I want to send a message to the Judi Guard team,
    So that I can get answers to my questions.

    Background:
        Given I am at the contact section of the homepage

    @success
    Scenario: Guest successfully submits the contact form
        When I enter "Test User" into the "name" field
        And I enter "test@example.com" into the "email" field
        And I enter "Test Inquiry" into the "subject" field
        And I enter "This is a message" into the "message" field
        And I press the "Contact Submit" button

        Then I should see the "Contact Submit" button in a submitting state
        And I should see a success notification with the text "Pesan Anda telah terkirim"

        And the "name" field should be empty
        And the "email" field should be empty
        And the "subject" field should be empty
        And the "message" field should be empty

    @failure @server_error
    Scenario: The Formspree server returns an error
        Given the contact form submission will fail

        When I enter "Ali" into the "name" field
        And I enter "ali@example.com" into the "email" field
        And I enter "Test Inquiry" into the "subject" field
        And I enter "This is a test message." into the "message" field
        And I press the "Contact Submit" button

        Then I should see the "Contact Submit" button in a submitting state
        And I should see a validation error message containing "Gagal mengirim pesan"
        And the "name" field should not be empty
        And the "email" field should not be empty
        And the "subject" field should not be empty
        And the "message" field should not be empty