Feature: Spam Analysis Workflow
    As a user,
    I want to process a video from selection to results,
    to detect gambling spam.

    Background:
        Given User is connected with his Youtube Account
        And User is on the analysis selection page

    Scenario: System detects gambling spam automatically (Polling Flow)
        When User searches for a video with link "https://youtube.com/watch?v=eeKxI45uZ0Y"
        And User initiates the analysis process from preview
        Then System displays the scanning progress screen

        When The analysis process completes
        Then System displays the analysis results page
        And System classifies comments as gambling spam or non-spam

    Scenario: Check analysis details
        Given Analysis results are available for "video123"
        When Each comment displays a confidence score
        Then Each comment displays a risk label that are High, Medium, or Low
        And System displays the detected keywords as analysis reasons

    Scenario: Filter comments by risk level
        Given Analysis results are available for "video123"
        When User selects the filter for "HIGH Risk"
        Then System displays only comments matching "HIGH" Risk