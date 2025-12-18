// import local modules
import { APIError } from '../api/error.api.js';
import { asyncHandler } from './async-handler.js';
import { REFRESH_TOKEN_COOKIE_CONFIG } from './constants.js';
import { envConfig } from './env.js';
import { Cohort, User } from '../models/index.js';

// import external modules
import jwt from 'jsonwebtoken';

// function to check if cohort exists
export const isCohortValid = asyncHandler(async (req, _, next) => {
  // get cohort from db
  const existingCohort = await Cohort.findOne({ cohortName: req.params.cohortName }).select(
    '_id allowedUserEmails'
  );

  // if cohort doesn't exist, throw an error
  if (!existingCohort)
    throw new APIError(404, {
      type: 'Cohort Validation Error',
      message: `Cohort with name '${req.params.cohortName}' does not exist`,
    });

  // set cohort in request object
  req.cohort = existingCohort;

  // forward request to next middleware
  next();
});

// function to check if user is allowed in the cohort
export const isUserAllowedInCohort = asyncHandler(async (req, _, next) => {
  // check if user's email is not in the allowed-user-emails list of the cohort
  if (!req.cohort.allowedUserEmails.includes(req.user.email))
    throw new APIError(403, {
      type: 'Cohort Authorization Error',
      message: `User with email '${req.user.email}' is not allowed in cohort '${req.cohort.cohortName}'`,
    });

  // forward request to next middleware
  next();
});

// function to check for any validation errors
export const validateSchema = zodSchema =>
  asyncHandler(async (req, _, next) => {
    // get validation result by parsing the request-body with the given zod-schema
    const validationResult = zodSchema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
      files: req.files,
    });

    // if validation fails, throw an error
    if (!validationResult.success)
      throw new APIError(400, {
        type: 'Validation Error',
        message: 'Invalid request data',
        issues: validationResult.error.issues.map(
          issue => `${issue.path.join('.') || 'All fields'}: ${issue.message}`
        ),
      });

    // forward request to next middleware
    next();
  });

// function to check for logged-in user
export const isLoggedIn = asyncHandler(async (req, _, next) => {
  // get authorization headers
  const authorizationHeaders = req.headers.authorization;
  if (!authorizationHeaders || !authorizationHeaders.startsWith('Bearer '))
    throw new APIError(401, {
      type: 'Authentication Error',
      message: 'Access Token is missing or in an invalid format',
    });

  // function to decode access token
  const decodedToken = decodeAccessToken(authorizationHeaders.split(' ')[1]);

  // check if user exists
  const loggedInUser = await User.findById(decodedToken?.id);
  if (!loggedInUser)
    throw new APIError(401, {
      type: 'Authentication Error',
      message: 'User associated with this token no longer exists',
    });

  // set user in request object
  req.user = {
    id: loggedInUser._id,
    email: loggedInUser.email,
    role: loggedInUser.role,
  };

  // forward request to next middleware
  next();
});

// function to check for an active session
export const isSessionActive = asyncHandler(async (req, _, next) => {
  // if refresh-token cookie is present, throw an error
  if (req.cookies[REFRESH_TOKEN_COOKIE_CONFIG.NAME])
    throw new APIError(403, {
      type: 'Active Session Error',
      message: 'User already logged in with an active session',
    });

  // forward request to next middleware
  next();
});

// function for checking if user has required role
export const hasRequiredRole = roles =>
  asyncHandler(async (req, _, next) => {
    // check if user doesn't have any one of the required roles
    if (!roles.includes(req.user.role))
      throw new APIError(403, {
        type: 'Authorization Error',
        message: 'Access denied, insufficient permissions',
      });

    // forward request to next middleware
    next();
  });

// sub-function to decode access token
function decodeAccessToken(accessToken) {
  try {
    return jwt.verify(accessToken, envConfig.ACCESS_TOKEN_SECRET);
  } catch (error) {
    // if token is expired, throw an TokenExpiredError
    if (error.name === 'TokenExpiredError')
      throw new APIError(401, {
        type: 'Token Expired Error',
        message: 'Access Token expired, generate a new one',
      });

    // for any other error, throw a JWT error
    throw new APIError(401, {
      type: 'JWT Error',
      message: 'Access Token is invalid',
    });
  }
}
