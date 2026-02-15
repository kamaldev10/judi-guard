Feature: Comment Moderation
    As a user,
    I want to delete spam comments and undo the action if necessary,
    to maintain a clean comment section.

    Background:
        Given User is connected with his Youtube Account
        And User is on the analysis results page with comments

    Scenario: User deletes a single comment with Ban Author
        When User selects comment from "Spammer Fixture"
        And User clicks delete button
        And User confirms deletion with "Ban Author" option enabled
        Then System updates the comment status to "Dihapus"
        And System displays a success notification with Undo option

    Scenario:  User moderates comments in bulk
        When User selects all comments in the list
        And User clicks delete button
        And User confirms deletion without Ban Author
        Then System updates all selected comments status to "Dihapus"

    Scenario:  Undo moderation action
        Given A comment has been deleted recently
        When User clicks "UNDO SEKARANG" on the notification
        Then System restores the comment status to Active