Feature: History and Reporting
    As a user,
    I want to view past analysis activities and download moderation reports,
    to keep track of my actions.

    Background:
        Given User is connected with his Youtube Account

    Scenario: View analysis and moderation history
        Given History data exists
        When User opens the analysis history page
        Then System displays analysis and moderation records in a table

    Scenario: Download report
        Given User is on the analysis history page
        When User opens the report dialog
        And User selects a date period "1" to "5"
        And User generates the preview
        Then System displays the report summary statistics
        When User clicks download PDF
        Then System generates and downloads the report file