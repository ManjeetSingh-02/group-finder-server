// import local modules
import { envConfig } from '../../../utils/env.js';
import { GOOGLE_OAUTH_CONFIG, COOKIE_CONFIG } from '../../../utils/constants.js';
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIError } from '../../error.api.js';
import { APIResponse } from '../../response.api.js';

// import external modules
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

// OAuth2 Client initialization
const OAuth2ClientInstance = new OAuth2Client(
  envConfig.GOOGLE_CLIENT_ID,
  envConfig.GOOGLE_CLIENT_SECRET,
  envConfig.GOOGLE_REDIRECT_URI
);

// sub-function to generateTemporaryToken
function generateTemporaryToken(length) {
  return crypto.randomBytes(length).toString('hex');
}

// @controller GET /google
export const googleLogin = asyncHandler(async (req, res) => {
  // generate state and nonce for OAuth2
  const authState = generateTemporaryToken(16);
  const authNonce = generateTemporaryToken(16);

  // store state and nonce in cookies
  res.cookie(COOKIE_CONFIG.STATE_NAME, authState, COOKIE_CONFIG.OPTIONS);
  res.cookie(COOKIE_CONFIG.NONCE_NAME, authNonce, COOKIE_CONFIG.OPTIONS);

  // redirect user to Google's OAuth2 consent page
  return res.redirect(
    `${GOOGLE_OAUTH_CONFIG.AUTH_URI}?client_id=${envConfig.GOOGLE_CLIENT_ID}&redirect_uri=${envConfig.GOOGLE_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(GOOGLE_OAUTH_CONFIG.DEFAULT_SCOPES)}&access_type=offline&prompt=consent&state=${authState}&nonce=${authNonce}`
  );
});

// @controller GET /google/callback
export const googleLoginCallback = asyncHandler(async (req, res) => {
  // STATE VERIFICATION (CSRF PROTECTION)
  if (!req.query.state || req.query.state !== req.signedCookies[COOKIE_CONFIG.STATE_NAME]) {
    // clear cookies
    res.clearCookie(COOKIE_CONFIG.STATE_NAME);
    res.clearCookie(COOKIE_CONFIG.NONCE_NAME);

    // throw error for invalid oauthState
    throw new APIError(400, {
      type: 'Google Login Callback Error',
      message: 'Invalid oauthState received from Google',
    });
  }

  // clear oauthState cookie as it's already verified
  res.clearCookie(COOKIE_CONFIG.STATE_NAME);

  // get tokens by exchanging authorization code
  const { tokens } = await OAuth2ClientInstance.getToken(req.query.code);
  if (!tokens || !tokens.id_token) {
    // clear oauthNonce cookie
    res.clearCookie(COOKIE_CONFIG.NONCE_NAME);

    // throw error for token fetch failure
    throw new APIError(500, {
      type: 'Google Login Callback Error',
      message: 'Something went wrong while fetching tokens from Google',
    });
  }

  // check oauthNonce cookie existence
  if (!req.signedCookies[COOKIE_CONFIG.NONCE_NAME]) {
    // clear oauthNonce cookie
    res.clearCookie(COOKIE_CONFIG.NONCE_NAME);

    // throw error for missing oauthNonce
    throw new APIError(400, {
      type: 'Google Login Callback Error',
      message: 'oauthNonce cookie is missing',
    });
  }

  // ID TOKEN VERIFICATION (NONCE PROTECTION)
  const ticket = await OAuth2ClientInstance.verifyIdToken({
    idToken: tokens.id_token,
    audience: envConfig.GOOGLE_CLIENT_ID,
    nonce: req.signedCookies[COOKIE_CONFIG.NONCE_NAME],
  });

  // clear oauthNonce cookie as it's already verified
  res.clearCookie(COOKIE_CONFIG.NONCE_NAME);

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Google Login Successful',
      data: {
        tokens,
        userInfo: ticket.getPayload(),
      },
    })
  );
});
