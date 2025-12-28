// import local modules
import { APIErrorResponse } from '../../api/response.api.js';
import { asyncHandler } from '../async-handler.js';
import { Application } from '../../models/index.js';
import { APPLICATION_STATUS } from '../constants.js';

// function to check if application exists in the group
export const doesApplicationExistInGroup = asyncHandler();

// function to check if user already has a pending application to any group
export const userAlreadyHasAPendingApplication = asyncHandler(async (req, _, next) => {
  // find pending application by the user
  const pendingApplication = await Application.findOne({
    'applicantDetails.applicantID': req.user.id,
    applicationStatus: APPLICATION_STATUS.PENDING,
  }).lean();
  if (pendingApplication)
    throw new APIErrorResponse(400, {
      type: 'Pending Application Error',
      message:
        'User already has a pending application, please wait for it to be reviewed or withdraw it before applying again.',
    });

  // forward request to next middleware
  next();
});
