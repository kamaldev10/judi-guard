@text-prediction
Feature: Text Prediction
    As a User,
    I want to predict the classification of a piece of text,
    So that I can know if it contains gambling-related content or not.

    Background:
        Given I am at the text prediction section of the homepage

    @success
    Scenario Outline: User successfully predicts various types of text
        When I enter "<text_input>" into the "text" field
        And I press the "Analyze" button
        Then I should see a heading with the text "Hasil Prediksi"
        And I should see a message with the text "Model: distilbert-flask-v1"
        And I should see the classification result was "<classification>"
        And I should see the confidence score was "<score>"

        Examples:
            | text_input                            | classification | score |
            | ayo main slot gacor di link ini       | JUDI           | 95.8% |
            | video tutorial yang sangat bermanfaat | NON_JUDI       | 99.2% |

    @failure @validation
    Scenario: User tries to submit empty text
        When I press the "Analyze" button
        Then I should see a validation error message containing "⚠️ Tidak ada teks yang diprediksi. Silahkan masukkan teks Anda."
        And the prediction API should not be called

    @failure @api_error
    Scenario: The system fails to return a prediction
        Given the prediction system is unavailable
        When I enter "Ini adalah teks acak" into the "text" field
        And I press the "Analyze" button
        Then I should see a validation error message containing "Gagal terhubung ke model AI."