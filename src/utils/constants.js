// import local modules
import { envConfig } from './env.js';

// google OAuth constants
export const GOOGLE_OAUTH_CONFIG = {
  AUTH_URI: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URI: 'https://oauth2.googleapis.com/token',
  USERINFO_URI: 'https://www.googleapis.com/oauth2/v2/userinfo',
  DEFAULT_SCOPES: 'openid email profile',
  SCOPE_GRANT_TYPE: 'authorization_code',
};

// google OAuth Cookie constants
export const OAUTH_COOKIE_CONFIG = {
  STATE_NAME: 'oauthState',
  NONCE_NAME: 'oauthNonce',
  OPTIONS: {
    httpOnly: true,
    secure: envConfig.NODE_ENV === 'production',
    signed: true,
    sameSite: 'Lax',
    maxAge: 5 * 60 * 1000,
  },
};

// export accessToken expiry duration(15 mins)
export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;

// export refreshToken expiry duration (24 hrs)
export const REFRESH_TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// export refreshToken Cookie constants
export const REFRESH_TOKEN_COOKIE_CONFIG = {
  NAME: 'refreshToken',
  OPTIONS: {
    httpOnly: true,
    secure: envConfig.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// user roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
};

// all userRoles array
export const availableUserRoles = Object.values(USER_ROLES);
