// src/utils/googleOAuth2Client.js
const { google } = require("googleapis");
const config = require("../config/environment");

// Validasi Env Variables (Opsional, untuk debugging)
if (!config.youtube.clientId || !config.youtube.clientSecret) {
  console.error(
    "ERROR: Google Client ID or Secret is missing in .env configuration",
  );
}

const googleOAuth2Client = new google.auth.OAuth2(
  config.youtube.clientId,
  config.youtube.clientSecret,
);

module.exports = googleOAuth2Client;
