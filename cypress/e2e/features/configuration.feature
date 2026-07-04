Feature: Configuration
    As a user,
    I want to manage whitelist and blacklist,
    to improve accuracy.

    Background:
        Given User is connected with his Youtube Account
        And User is on the configuration page

    # Whitelist Scenarios
    Scenario: Add a channel to whitelist (Basic)
        When User adds "@UCbX_TueacKEifdw8lAjARNQ" to whitelist
        Then System displays "@UCbX_TueacKEifdw8lAjARNQ" in the whitelist table

    Scenario: Add a channel with details to whitelist
        When User adds "@UCbX_TueacKEifdw8lAjARNQ" with name "Nadia Omara" and note "Horror Podcast" to whitelist
        Then System displays "Nadia Omara" in the whitelist table
        And The whitelist item "@UCbX_TueacKEifdw8lAjARNQ" contains note "Horror Podcast"

    # non-happy path scenarios
    Scenario: Add a duplicate channel to the whitelist
        Given The whitelist table contains "@UCbX_TueacKEifdw8lAjARNQ"
        When User attempts to add a duplicate "@UCbX_TueacKEifdw8lAjARNQ" to whitelist
        Then System displays a warning "Channel ini sudah ada di whitelist Anda."

    Scenario: User attempts to add an empty channel
        When User submits an empty input for whitelist
        Then System prevents submission and disables the add button

    Scenario: Delete a channel from whitelist
        Given The whitelist table contains "@UCbX_TueacKEifdw8lAjARNQ"
        When User deletes "@UCbX_TueacKEifdw8lAjARNQ" from whitelist
        Then System removes "@UCbX_TueacKEifdw8lAjARNQ" from the whitelist table

    # Blacklist Scenarios
    Scenario: Add a keyword to blacklist
        When User adds "gacor" to blacklist
        Then System displays "gacor" in the blacklist table

    Scenario: Delete a keyword from blacklist
        Given The blacklist table contains "zeus"
        When User deletes "zeus" from blacklist
        Then System removes "zeus" from the blacklist table

    # non-happy path scenarios
    Scenario: Add a duplicate keyword to the blacklist
        Given The blacklist table contains "zeus"
        When User types "zeus" in the blacklist input and presses Enter
        Then System rejects the input and displays a warning "Kata kunci sudah ada di daftar"