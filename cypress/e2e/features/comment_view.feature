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

    Scenario: User selects a video from the uploaded grid
        Given User is on the analysis page
        When User clicks on a video card from the recent uploads grid
        Then System displays the list of comments from the selected video

    # non-happy path scenarios
    Scenario: User inputs an invalid video link
        Given User is on the analysis page
        When User inputs an invalid video link "https://youtube.com/invalid-link"
        Then System displays an error message "Video tidak ditemukan"

    Scenario: User inputs a video link that has no comments
        Given User is on the analysis page
        When User inputs a video link that has no comments
        Then System displays preview empty message "Tidak ada komentar ditemukan atau belum dimuat."

    Scenario: User inputs a video link where comments are disabled
        Given User is on the analysis page
        When User inputs a video link with disabled comments
        Then System displays a specific error message "Gagal memuat preview komentar."

    Scenario: User channel has no uploaded videos
        When User is on the analysis page but no videos are found for the channel
        Then System displays the empty state message "Tidak ada video ditemukan di channel ini."
        And System displays a "Coba Refresh" button
