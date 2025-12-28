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

// export accessToken expiry duration(5 mins)
export const ACCESS_TOKEN_LIFETIME = 5 * 60 * 1000;

// export refreshToken expiry duration (24 hrs)
export const REFRESH_TOKEN_LIFETIME = 24 * 60 * 60 * 1000;

// export refreshToken Cookie constants
export const REFRESH_TOKEN_COOKIE_CONFIG = {
  NAME: 'refreshToken',
  OPTIONS: {
    httpOnly: true,
    secure: envConfig.NODE_ENV === 'production',
    sameSite: envConfig.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

// user roles
export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin', // can Create, Read and Update Cohorts
  COHORT_ADMIN: 'cohort_admin', // can Read and Update Cohorts
  STUDENT: 'student',
};

// all userRoles array
export const availableUserRoles = Object.values(USER_ROLES);

// CSV Upload Config
export const CSV_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPE: 'text/csv',
  FIELD_NAME: 'csvFiles',
  FIELD_MAX_COUNT: 1,
};

// maximum limit of members in a group
export const MAX_GROUP_MEMBERS = 4;

// application status
export const APPLICATION_STATUS = {
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  DENIED: 'denied',
  WITHDRAWN: 'withdrawn',
};

// all application status array
export const availableApplicationStatus = Object.values(APPLICATION_STATUS);

// default application reviewer feedbacks
export const DEFAULT_REVIEWER_FEEDBACK = {
  UNDER_REVIEW:
    'Your application has been received and is currently under review by creator of this group.',
  APPROVED:
    'Congratulations! Your application has been approved. You are now a member of this group.',
  DENIED:
    'Thank you for your interest. Unfortunately, the group creator has decided not to move forward with your application at this time.',
  WITHDRAWN: 'This application was withdrawn by the applicant before a decision was made.',
};
