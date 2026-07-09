import { google } from 'googleapis';
import config from '#config/environment.js';

if (!config.youtube.clientId || !config.youtube.clientSecret) {
  console.error('ERROR: Google Client ID or Secret is missing in .env configuration');
  process.exit(1);
}

const createGoogleOAuth2Client = (redirectUri) => {
  return new google.auth.OAuth2(
    config.youtube.clientId,
    config.youtube.clientSecret,
    redirectUri || config.youtube.redirectUri,
  );
};

export default createGoogleOAuth2Client;
