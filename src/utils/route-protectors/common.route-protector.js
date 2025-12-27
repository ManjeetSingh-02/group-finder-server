// import local modules
import { APIErrorResponse } from '../../api/response.api.js';
import { asyncHandler } from '../async-handler.js';
import { REFRESH_TOKEN_COOKIE_CONFIG } from '../constants.js';

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
      throw new APIErrorResponse(400, {
        type: 'Validation Error',
        message: 'Invalid request data',
        issues: validationResult.error.issues.map(
          issue => `${issue.path.join('.') || 'All fields'}: ${issue.message}`
        ),
      });

    // forward request to next middleware
    next();
  });

// function to check for an active session
export const isSessionActive = asyncHandler(async (req, _, next) => {
  // if refresh-token cookie is present, throw an error
  if (req.cookies[REFRESH_TOKEN_COOKIE_CONFIG.NAME])
    throw new APIErrorResponse(403, {
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
      throw new APIErrorResponse(403, {
        type: 'Authorization Error',
        message: 'Access denied, insufficient permissions',
      });

    // forward request to next middleware
    next();
  });
