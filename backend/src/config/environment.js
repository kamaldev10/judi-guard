// Termasuk YouTube API Key, Quota Limits, AI Service URL

// src/config/environment.js
require("dotenv").config();

const config = {
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI,
    apiKey: process.env.YOUTUBE_API_KEY,
  },
};

// Validasi variabel penting
if (!config.mongodbUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env file");
  process.exit(1);
}
if (!config.jwt.secret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
  process.exit(1);
}

if (
  !config.youtube.clientId ||
  !config.youtube.clientSecret ||
  !config.youtube.redirectUri
) {
  console.warn(
    "WARNING: YouTube OAuth Client ID, Secret, or Redirect URI is not defined in .env file. YouTube integration might fail."
  );
  process.exit(1);
}

module.exports = config;
