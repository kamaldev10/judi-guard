@profile
Feature: Profile Management
    As a logged-in User,
    I want to manage my profile information and account settings,
    So that I can keep my details up to date and secure my account.

    Background:
        Given I am logged in as "admin@gmail.com"
        And I am on the profile page

    @success @edit_profile
    Scenario: User successfully edits their username
        When I press the "Edit Profile" button
        Then I should be redirected to the "/profile/edit" page

        When I enter "my-new-username" into the "username" field
        And I press the "Save Profile" button

        Then I should see a popup title "Profil Diperbarui!"
        And I should see a success popup with the text "Data profil Anda telah berhasil diperbarui."
        And I close the popup
        And I should be redirected to the "/profile" page
        And I should see "my-new-username" on the page

    @failure @edit_profile
    Scenario: User tries to save without making any changes
        When I press the "Edit Profile" button
        Then I should be redirected to the "/profile/edit" page

        When I press the Save Profile button without making any changes
        Then I should see an info popup with the text "Anda tidak melakukan perubahan apapun pada data profil."
        And I close the popup
        And I should remain on the "/profile/edit" page


    @success @delete_account
    Scenario: User successfully deletes their account
        When I press the "Delete My Account" button
        Then I should see a popup title "Konfirmasi Hapus Akun"
        And I should see a warning popup with the text "Apakah Anda yakin ingin menghapus akun Anda secara permanen? Tindakan ini tidak dapat diurungkan."

        When I confirm the action in the popup
        Then I should see a popup title "Anda yakin?"
        And I should see a warning popup with the text "Akun Anda akan dihapus secara permanen!"

        When I confirm the action in the popup
        And I should see a success notification with the text "Akun Anda telah berhasil dihapus."
        And I should be redirected to the "/" page

    @failure @delete_account
    Scenario: User cancels the account deletion
        When I press the "Delete My Account" button
        And I cancel the action in the popup
        Then I should remain on the "/" page
        And I should not be logged out

    @authentication @guard
    Scenario: Guest  sees restricted access view when accessing profile
        Given I am a guest

        When I try to navigate directly to the "/profile" page

        Then I should see the restricted access view
        And I should see a heading with the text "Anda Belum Login"
        And I should see a message with the text "Untuk mengakses fitur ini, Anda perlu login terlebih dahulu."