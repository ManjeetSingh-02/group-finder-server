// import local modules
import { APIErrorResponse } from '../../api/response.api.js';
import { asyncHandler } from '../async-handler.js';
import { Cohort } from '../../models/index.js';

// function to check if cohort exists
export const isCohortValid = asyncHandler(async (req, _, next) => {
  // get cohort from db
  const existingCohort = await Cohort.findOne({ cohortName: req.params.cohortName })
    .select('_id allowedUserEmails')
    .lean();

  // if cohort doesn't exist, throw an error
  if (!existingCohort)
    throw new APIErrorResponse(404, {
      type: 'Cohort Validation Error',
      message: `Cohort with name '${req.params.cohortName}' does not exist`,
    });

  // set cohort in request object
  req.cohort = {
    id: existingCohort._id,
    allowedUserEmails: existingCohort.allowedUserEmails,
  };

  // forward request to next middleware
  next();
});

// function to check if user is allowed in the cohort
export const isUserAllowedInCohort = asyncHandler(async (req, _, next) => {
  // check if user's email is not in the allowed-user-emails list of the cohort
  if (!req.cohort.allowedUserEmails.includes(req.user.email))
    throw new APIErrorResponse(403, {
      type: 'Cohort Authorization Error',
      message: `User with email '${req.user.email}' is not allowed in cohort '${req.params.cohortName}'`,
    });

  // forward request to next middleware
  next();
});
