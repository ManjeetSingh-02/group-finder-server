// import local modules
import { envConfig } from '../../../utils/env.js';
import {
  GOOGLE_OAUTH_CONFIG,
  OAUTH_COOKIE_CONFIG,
  REFRESH_TOKEN_COOKIE_CONFIG,
} from '../../../utils/constants.js';
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Cohort, User } from '../../../models/index.js';

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
    throw new APIErrorResponse(403, {
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
    throw new APIErrorResponse(500, {
      type: 'Google Login Callback Error',
      message: 'Something went wrong while fetching tokens from Google',
    });
  }

  // check oauthNonce cookie existence
  if (!req.signedCookies[OAUTH_COOKIE_CONFIG.NONCE_NAME]) {
    // clear oauthNonce cookie
    res.clearCookie(OAUTH_COOKIE_CONFIG.NONCE_NAME);

    // throw error for missing oauthNonce
    throw new APIErrorResponse(400, {
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
    throw new APIErrorResponse(500, {
      type: 'Google Login Callback Error',
      message: 'Failed to verify from Google',
    });

  // extract user info from ticket payload
  const userDetails = {
    googleID: String(ticketPayload.sub),
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
      new APISuccessResponse(200, {
        message: 'Google Login Successful',
        data: { accessToken },
      })
    );
});

// @controller GET /logout
export const googleLogout = asyncHandler(async (req, res) => {
  // get user from db and set refreshToken to null
  await User.findByIdAndUpdate(req.user.id, {
    refreshToken: null,
  });

  // set req.user to null
  req.user = null;

  // success status to user
  // clear refreshToken cookie
  return res
    .status(200)
    .clearCookie(REFRESH_TOKEN_COOKIE_CONFIG.NAME, REFRESH_TOKEN_COOKIE_CONFIG.OPTIONS)
    .json(new APISuccessResponse(200, { message: 'Logout Successful' }));
});

// @controller PATCH /token/refresh
export const refreshTokens = asyncHandler(async (req, res) => {
  // get old refresh token from cookies
  const oldRefreshToken = req.signedCookies[REFRESH_TOKEN_COOKIE_CONFIG.NAME];
  if (!oldRefreshToken)
    throw new APIErrorResponse(401, {
      type: 'Token Refresh Error',
      message: 'No refresh token provided',
    });

  // decode old refresh token
  const decodedToken = decodeRefreshToken(oldRefreshToken);

  // check if user exists
  const existingUser = await User.findById(decodedToken?.id).select('refreshToken');
  if (!existingUser)
    throw new APIErrorResponse(404, {
      type: 'Token Refresh Error',
      message: 'User associated with this token no longer exists',
    });

  // compare oldRefreshToken with the one in db
  if (existingUser.refreshToken !== oldRefreshToken)
    throw new APIErrorResponse(401, {
      type: 'Token Refresh Error',
      message: 'Refresh token is invalid',
    });

  // generate new tokens
  const { accessToken, refreshToken } = await generateTokens(existingUser);

  // success status to user
  // save refreshToken in httpOnly cookie
  // send accessToken in response
  return res
    .status(200)
    .cookie(REFRESH_TOKEN_COOKIE_CONFIG.NAME, refreshToken, REFRESH_TOKEN_COOKIE_CONFIG.OPTIONS)
    .json(
      new APISuccessResponse(200, {
        message: 'Token Refresh Successful',
        data: { accessToken },
      })
    );
});

// sub-function to handle login and registration flow for Google OAuth2
async function handleGoogleLogin(userDetails) {
  // check if user is already registered
  const existingUser = await User.findOne({ email: userDetails.email }).select(
    'googleID refreshToken'
  );

  // --------------------------------------------------
  // LOGIN PATH: User is already registered
  // --------------------------------------------------

  // If user exists, check for any missing googleID (Mainly ADMIN's) and update it
  if (existingUser) {
    if (!existingUser.googleID) {
      // update googleID in db
      existingUser.googleID = userDetails.googleID;

      // save user
      await existingUser.save();
    }

    return generateTokens(existingUser);
  }

  // --------------------------------------------------
  // REGISTRATION PATH: User is not registered
  // --------------------------------------------------

  // Check if user is allowed in any cohorts
  const allowedCohorts = await Cohort.find({
    allowedUserEmails: { $in: [userDetails.email] },
  })
    .select('_id')
    .lean();

  // if not allowed, throw error
  if (allowedCohorts.length === 0)
    throw new APIErrorResponse(403, {
      type: 'Google Login Callback Error',
      message: 'You are not authorized to access this application.',
    });

  // create a new user in db
  const newUser = await User.create({
    googleID: userDetails.googleID,
    email: userDetails.email,
    username: `${userDetails.email.split('@')[0].slice(0, 10)}${generateRandomSuffix()}`,
  });
  if (!newUser)
    throw new APIErrorResponse(500, {
      type: 'Google Login Callback Error',
      message: 'Something went wrong while creating a new user.',
    });

  return generateTokens(newUser);
}

// sub-function to generate access and refresh tokens
async function generateTokens(user) {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // update refresh token in db
  user.refreshToken = refreshToken;

  // save user
  await user.save({ validateBeforeSave: false });

  // return access and refresh tokens
  return { accessToken, refreshToken };
}

// sub-function to generate a random suffix for username
function generateRandomSuffix() {
  return Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, '0');
}

// sub-function to decode refresh token
function decodeRefreshToken(refreshToken) {
  try {
    return jwt.verify(refreshToken, envConfig.REFRESH_TOKEN_SECRET);
  } catch (error) {
    // if error in verification, throw invalid token error
    throw new APIErrorResponse(401, {
      type: 'Token Refresh Error',
      message: 'Invalid refresh token',
    });
  }
}
