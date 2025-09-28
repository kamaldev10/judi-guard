// src/utils/googleOAuth2Client.js
const { google } = require("googleapis");
const config = require("../config/environment");

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    config.youtube.clientId,
    config.youtube.clientSecret,
    config.youtube.redirectUri
  );
};

module.exports = { createOAuth2Client };
