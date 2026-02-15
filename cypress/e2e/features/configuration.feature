Feature: Configuration
    As a user,
    I want to manage whitelist and blacklist,
    to improve accuracy.

    Background:
        Given User is connected with his Youtube Account
        And User is on the configuration page

    Scenario: Add a channel to whitelist (Basic)
        When User adds "@TrustedUser" to whitelist
        Then System displays "@TrustedUser" in the whitelist table

    Scenario: Add a channel with details to whitelist
        When User adds "@GadgetIn" with name "GadgetIn Official" and note "Tech Reviewer" to whitelist
        Then System displays "GadgetIn Official" in the whitelist table
        And The whitelist item "@GadgetIn" contains note "Tech Reviewer"

    Scenario: Delete a channel from whitelist
        Given The whitelist table contains "OldChannel"
        When User deletes "OldChannel" from whitelist
        Then System removes "OldChannel" from the whitelist table

    Scenario: Add a keyword to blacklist
        When User adds "gacor" to blacklist
        Then System displays "gacor" in the blacklist table

    Scenario: Delete a keyword from blacklist
        Given The blacklist table contains "zeus"
        When User deletes "zeus" from blacklist
        Then System removes "zeus" from the blacklist table