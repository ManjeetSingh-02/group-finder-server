// import local modules
import { envConfig } from '../../../utils/env.js';
import {
  GOOGLE_OAUTH_CONFIG,
  OAUTH_COOKIE_CONFIG,
  REFRESH_TOKEN_COOKIE_CONFIG,
} from '../../../utils/constants.js';
import { asyncHandler } from '../../../utils/async-handler.js';
import { handleGoogleLogin } from '../../../utils/google-auth.js';
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

// @controller GET /login/google
export const googleLogin = asyncHandler(async (_, res) => {
  // generate state and nonce for OAuth2
  const authState = generateTemporaryToken(16);
  const authNonce = generateTemporaryToken(16);

  // store state and nonce in cookies
  res.cookie(OAUTH_COOKIE_CONFIG.STATE_NAME, authState, OAUTH_COOKIE_CONFIG.OPTIONS);
  res.cookie(OAUTH_COOKIE_CONFIG.NONCE_NAME, authNonce, OAUTH_COOKIE_CONFIG.OPTIONS);

  // redirect user to Google's OAuth2 consent page
  return res.redirect(
    `${GOOGLE_OAUTH_CONFIG.AUTH_URI}?client_id=${envConfig.GOOGLE_CLIENT_ID}&redirect_uri=${envConfig.GOOGLE_REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(GOOGLE_OAUTH_CONFIG.DEFAULT_SCOPES)}&prompt=select_account&state=${authState}&nonce=${authNonce}`
  );
});

// @controller GET /login/google/callback
export const googleLoginCallback = asyncHandler(async (req, res) => {
  // STATE VERIFICATION (CSRF PROTECTION)
  if (!req.query.state || req.query.state !== req.signedCookies[OAUTH_COOKIE_CONFIG.STATE_NAME]) {
    // clear cookies
    res.clearCookie(OAUTH_COOKIE_CONFIG.STATE_NAME);
    res.clearCookie(OAUTH_COOKIE_CONFIG.NONCE_NAME);

    // throw error for invalid oauthState
    throw new APIError(400, {
      type: 'Google Login Callback Error',
      message: 'Invalid oauthState received from Google',
    });
  }

  // clear oauthState cookie as it's already verified
  res.clearCookie(OAUTH_COOKIE_CONFIG.STATE_NAME);

  // get tokens by exchanging authorization code
  const { tokens } = await OAuth2ClientInstance.getToken(req.query.code);
  if (!tokens || !tokens.id_token) {
    // clear oauthNonce cookie
    res.clearCookie(OAUTH_COOKIE_CONFIG.NONCE_NAME);

    // throw error for token fetch failure
    throw new APIError(500, {
      type: 'Google Login Callback Error',
      message: 'Something went wrong while fetching tokens from Google',
    });
  }

  // check oauthNonce cookie existence
  if (!req.signedCookies[OAUTH_COOKIE_CONFIG.NONCE_NAME]) {
    // clear oauthNonce cookie
    res.clearCookie(OAUTH_COOKIE_CONFIG.NONCE_NAME);

    // throw error for missing oauthNonce
    throw new APIError(400, {
      type: 'Google Login Callback Error',
      message: 'oauthNonce cookie is missing',
    });
  }

  // ID TOKEN VERIFICATION (NONCE PROTECTION)
  const verificationTicket = await OAuth2ClientInstance.verifyIdToken({
    idToken: tokens.id_token,
    audience: envConfig.GOOGLE_CLIENT_ID,
    nonce: req.signedCookies[OAUTH_COOKIE_CONFIG.NONCE_NAME],
  });

  // clear oauthNonce cookie as it's already verified
  res.clearCookie(OAUTH_COOKIE_CONFIG.NONCE_NAME);

  // extract payload from verificationTicket
  const ticketPayload = verificationTicket?.getPayload();

  // check if ticketPayload is valid
  if (!ticketPayload)
    throw new APIError(500, {
      type: 'Google Login Callback Error',
      message: 'Failed to verify from Google',
    });

  // extract user info from ticket payload
  const userDetails = {
    googleID: String(ticketPayload.sub),
    fullName: String(ticketPayload.name),
    email: String(ticketPayload.email).toLowerCase(),
  };

  // handle googleLogin, retrieve tokens
  const { accessToken, refreshToken } = await handleGoogleLogin(userDetails);

  // success status to user
  // save refreshToken in httpOnly cookie
  // send accessToken in response
  return res
    .status(200)
    .cookie(REFRESH_TOKEN_COOKIE_CONFIG.NAME, refreshToken, REFRESH_TOKEN_COOKIE_CONFIG.OPTIONS)
    .json(
      new APIResponse(200, {
        message: 'Google Login Successful',
        data: { accessToken },
      })
    );
});
