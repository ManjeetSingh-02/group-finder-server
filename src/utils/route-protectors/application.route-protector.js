// import local modules
import { APIErrorResponse } from '../../api/response.api.js';
import { asyncHandler } from '../async-handler.js';
import { Application } from '../../models/index.js';
import { APPLICATION_STATUS } from '../constants.js';

// function to check if application exists in the group
export const doesApplicationExistInGroup = asyncHandler(async (req, _, next) => {
  // find application by applicationID and groupID
  const existingApplication = await Application.findOne({
    _id: req.params.applicationID,
    'applicantDetails.groupID': req.params.groupID,
  }).lean();
  if (!existingApplication)
    throw new APIErrorResponse(404, {
      type: 'Fetch Application Error',
      message: 'Application not found in the specified group',
    });

  // set application in request object
  req.application = {
    id: existingApplication._id,
    applicationStatus: existingApplication.applicationStatus,
  };

  // forward request to next middleware
  next();
});

// function to check if user already has a under review application
export const userAlreadyHasUnderReviewApplication = asyncHandler(async (req, _, next) => {
  // find pending application by the user
  const pendingApplication = await Application.findOne({
    'applicantDetails.applicantID': req.user.id,
    applicationStatus: APPLICATION_STATUS.UNDER_REVIEW,
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
