Feature: Comment View
    As a user,
    I want to view comments from a YouTube video,
    so I can perform the analysis process.

    Background:
        Given User is connected with his Youtube Account

    Scenario: User views comments from a YouTube video
        Given User is on the analysis page
        When User inputs a valid video link
        Then System displays the list of comments from the video