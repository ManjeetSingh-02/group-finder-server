// import local modules
import { APIErrorResponse } from '../../api/response.api.js';
import { asyncHandler } from '../async-handler.js';
import { Application } from '../../models/index.js';
import { APPLICATION_STATUS, APPLICATION_WITHDRAWAL_TIME_LIMIT_IN_HOURS } from '../constants.js';

// function to check if application exists in the group
export const doesApplicationExistInGroup = asyncHandler(async (req, _, next) => {
  // find application by applicationID and groupID
  const existingApplication = await Application.findOne({
    _id: req.params.applicationID,
    associatedGroup: req.group.id,
  })
    .select('_id createdAt')
    .lean();
  if (!existingApplication)
    throw new APIErrorResponse(404, {
      type: 'Fetch Application Error',
      message: 'Application not found in the specified group',
    });

  // set application in request object
  req.application = {
    id: existingApplication._id,
    createdAt: new Date(existingApplication.createdAt).getTime(),
  };

  // forward request to next middleware
  next();
});

// function to check if user can withdraw application
export const canUserWithdrawApplication = asyncHandler(async (req, _, next) => {
  // calculate hours since application creation
  const hoursSinceCreation = (Date.now() - req.application.createdAt) / (1000 * 60 * 60);

  // if application has been created less than the time limit, throw error
  if (hoursSinceCreation < APPLICATION_WITHDRAWAL_TIME_LIMIT_IN_HOURS) {
    // calculate remaining time
    const remainingHours = Math.ceil(
      APPLICATION_WITHDRAWAL_TIME_LIMIT_IN_HOURS - hoursSinceCreation
    );

    throw new APIErrorResponse(400, {
      type: 'Withdraw Application Error',
      message: `Application can be withdrawn only after ${APPLICATION_WITHDRAWAL_TIME_LIMIT_IN_HOURS} hours, please wait ${remainingHours} more hour(s).`,
    });
  }

  // forward request to next middleware
  next();
});

// function to check if user already has a under review application
export const userAlreadyHasUnderReviewApplication = asyncHandler(async (req, _, next) => {
  // find pending application by the user
  const pendingApplication = await Application.findOne({
    'applicantDetails.associatedUser': req.user.id,
    applicationStatus: APPLICATION_STATUS.UNDER_REVIEW,
  }).lean();
  if (pendingApplication)
    throw new APIErrorResponse(400, {
      type: 'Pending Application Error',
      message:
        'User already has a application which is under review, please wait for it to be reviewed or withdraw it before applying to a group or creating a new group',
    });

  // forward request to next middleware
  next();
});
