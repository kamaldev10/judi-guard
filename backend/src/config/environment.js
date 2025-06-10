// Termasuk YouTube API Key, Quota Limits, AI Service URL

// src/config/environment.js
require("dotenv").config();

const config = {
  appName: process.env.APP_NAME || "Judi Guard Application",
  port: process.env.PORT || 3001,
  mongodbUri: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
  googleSignIn: {
    clientId: process.env.GOOGLE_SIGN_IN_CLIENT_ID,
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri: process.env.YOUTUBE_REDIRECT_URI,
    apiKey: process.env.YOUTUBE_API_KEY,
  },
  // Konfigurasi Email umum (jika masih digunakan untuk SMTP lain)
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },

  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
    senderEmail:
      process.env.MAILGUN_SENDER_EMAIL ||
      `"${process.env.APP_NAME || "Judi Guard"}" <no-reply@${
        process.env.MAILGUN_DOMAIN
      }>`,
  },
  //maksimal top level comment dan replies per comment
  MAX_TOP_LEVEL_COMMENTS: 50,
  MAX_REPLIES_PER_COMMENT: 20,
};

if (
  process.env.NODE_ENV === "production" &&
  (!config.mailgun.apiKey || !config.mailgun.domain)
) {
  console.warn(
    "WARNING: Mailgun API Key or Domain is not defined for production. Email sending might fail or use fallback."
  );
}

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
