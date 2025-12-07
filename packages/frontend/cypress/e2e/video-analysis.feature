@video_analysis
Feature: Video Comment Analysis
    As a User,
    I want to analyze comments from a YouTube video,
    So that I can see the classification (Gambling/Clean) for all comments.

    Background:
        Given I am on the video analysis page

    @success @authenticated
    Scenario: User successfully analyzes a new video
        Given I am logged in as "admin@gmail.com"
        And my YouTube account is connected

        When I scroll to the "video analysis form" section
        And I enter "https://www.youtube.com/watch?v=video123" into the "video url" field
        And I press the "Start Analysis" button
        Then I should see a loading popup
        And I close the popup

        When the analysis status changes to "COMPLETED"
        And I should see a heading with the text "My Test Video"
        And I should see the analysis summary
        And I should see the list of analyzed comments

    @failure @validation @authenticated
    Scenario: User tries to analyze an invalid YouTube URL
        Given I am logged in as "admin@gmail.com"
        And my YouTube account is connected

        When I scroll to the "video analysis form" section
        And I enter "invalid-link" into the "video url" field
        And I press the "Start Analysis" button
        Then I should see a popup title "Input Tidak Valid"
        And I close the popup
        And the analysis API should not be called

    @failure @not_found @authenticated
    Scenario: User tries to analyze a non-existent video
        Given I am logged in as "admin@gmail.com"
        And my YouTube account is connected

        When I scroll to the "video analysis form" section
        And I enter "https://www.youtube.com/watch?v=notfound123" into the "video url" field
        And I press the "Start Analysis" button

        Then I should see a validation error message containing "404"
        And I close the popup


    @guard @youtube_connection
    Scenario: User tries to analyze without connecting YouTube account
        Given I am logged in as "admin@gmail.com"
        But my YouTube account is NOT connected

        When I scroll to the "video analysis form" section
        And I enter "https://www.youtube.com/watch?v=video123" into the "video url" field
        And I press the "Start Analysis" button

        Then I should see a popup title "Koneksi YouTube Diperlukan"
        And I close the popup

    @guard @unauthenticated
    Scenario: Guest tries to analyze a video
        Given I am a guest
        When I scroll to the "video analysis form" section
        And I enter "https://www.youtube.com/watch?v=video123" into the "video url" field
        And I press the "Start Analysis" button

        Then I should see a popup title "Gagal Memuat Data Pengguna"
        And I close the popup