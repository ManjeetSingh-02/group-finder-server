// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Application, Group, User } from '../../../models/index.js';
import { runInTransaction } from '../../../utils/db.js';
import { APPLICATION_STATUS, DEFAULT_REVIEWER_FEEDBACK } from '../../../utils/constants.js';

// @controller POST /
export const postApplication = asyncHandler(async (req, res) => {
  // run the application creation in a transaction session
  await runInTransaction(async mongooseSession => {
    // fetch group from db
    const existingGroup = await Group.findById(req.group.id)
      .session(mongooseSession)
      .select('maximumMembersCount groupMembersCount')
      .lean();

    // check if group is already full
    if (existingGroup.groupMembersCount === existingGroup.maximumMembersCount)
      throw new APIErrorResponse(400, {
        type: 'Create Application Error',
        message: 'Group already has maximum number of members',
      });

    // create new application (model.create returns an array when used with session)
    await Application.create(
      [
        {
          associatedCohort: req.cohort.id,
          associatedGroup: req.group.id,
          applicantDetails: {
            associatedUser: req.user.id,
            applicantPitch: req.body.applicantPitch,
            applicantResources: req.body.applicantResources,
            applicantSkills: req.body.applicantSkills,
          },
        },
      ],
      { session: mongooseSession }
    );
  });

  // send success status to user
  return res.status(201).json(
    new APISuccessResponse(201, {
      message: 'Applied to group successfully',
    })
  );
});

// @controller GET /
export const getAllGroupApplications = asyncHandler(async (req, res) => {
  // fetch all applications for the group
  const allGroupApplications = await Application.find({ associatedGroup: req.group.id })
    .select('_id applicationStatus applicantDetails applicationReviewerDetails createdAt updatedAt')
    .populate([
      {
        path: 'applicantDetails.associatedUser',
        select: '_id username',
      },
      {
        path: 'applicationReviewerDetails.associatedUser',
        select: '_id username',
      },
    ])
    .lean();

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Fetched all group applications successfully',
      data: {
        groupApplications: allGroupApplications,
      },
    })
  );
});

// @controller PATCH /:applicationID/approve
export const approveApplication = asyncHandler(async (req, res) => {
  // run the application approval in a transaction session
  await runInTransaction(async mongooseSession => {
    // fetch application from db
    const existingApplication = await Application.findById(req.application.id)
      .session(mongooseSession)
      .select('applicationStatus applicantDetails applicationReviewerDetails');

    // check if application is not under_review
    if (existingApplication.applicationStatus !== APPLICATION_STATUS.UNDER_REVIEW)
      throw new APIErrorResponse(400, {
        type: 'Approve Application Error',
        message: 'Only applications with status under_review can be approved',
      });

    // fetch group from db
    const existingGroup = await Group.findById(req.group.id)
      .session(mongooseSession)
      .select('maximumMembersCount groupMembersCount');

    // check if group is already full
    if (existingGroup.groupMembersCount === existingGroup.maximumMembersCount)
      throw new APIErrorResponse(400, {
        type: 'Approve Application Error',
        message: 'Group already has maximum number of members',
      });

    // fetch user from db
    const existingUser = await User.findById(existingApplication.applicantDetails.associatedUser)
      .session(mongooseSession)
      .select('currentGroup');

    // check if user is already in a group
    if (existingUser.currentGroup)
      throw new APIErrorResponse(400, {
        type: 'Approve Application Error',
        message: 'User is already in a group',
      });

    // update application status to approved, along with reviewer details and save it
    existingApplication.applicationStatus = APPLICATION_STATUS.APPROVED;
    existingApplication.applicationReviewerDetails = {
      associatedUser: req.user.id,
      applicationReviewerFeedback: req.body.reviewerFeedback ?? DEFAULT_REVIEWER_FEEDBACK.APPROVED,
    };
    await existingApplication.save({ session: mongooseSession });

    // increment group members count by 1 and save it
    existingGroup.groupMembersCount += 1;
    await existingGroup.save({ session: mongooseSession });

    // set user's current group to this group and save it
    existingUser.currentGroup = req.group.id;
    await existingUser.save({ session: mongooseSession });
  });

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Application successfully approved',
    })
  );
});

// @controller PATCH /:applicationID/deny
export const denyApplication = asyncHandler(async (req, res) => {
  // update application status to denied, along with reviewer details
  const updatedApplication = await Application.findOneAndUpdate(
    {
      _id: req.application.id,
      applicationStatus: APPLICATION_STATUS.UNDER_REVIEW,
    },
    {
      $set: {
        applicationStatus: APPLICATION_STATUS.DENIED,
        'applicationReviewerDetails.associatedUser': req.user.id,
        'applicationReviewerDetails.applicationReviewerFeedback':
          req.body.reviewerFeedback ?? DEFAULT_REVIEWER_FEEDBACK.DENIED,
      },
    },
    { new: true, runValidators: true }
  );
  if (!updatedApplication)
    throw new APIErrorResponse(400, {
      type: 'Deny Application Error',
      message: 'Only applications with status under_review can be denied',
    });

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Application successfully denied',
    })
  );
});

// @controller PATCH /:applicationID/withdraw
export const withdrawApplication = asyncHandler(async (req, res) => {
  // update application status to withdrawn, along with reviewer feedback
  const updatedApplication = await Application.findOneAndUpdate(
    {
      _id: req.application.id,
      applicationStatus: APPLICATION_STATUS.UNDER_REVIEW,
    },
    {
      $set: {
        applicationStatus: APPLICATION_STATUS.WITHDRAWN,
        'applicationReviewerDetails.associatedUser': null,
        'applicationReviewerDetails.applicationReviewerFeedback':
          DEFAULT_REVIEWER_FEEDBACK.WITHDRAWN,
      },
    },
    { new: true, runValidators: true }
  );
  if (!updatedApplication)
    throw new APIErrorResponse(400, {
      type: 'Withdraw Application Error',
      message: 'Only applications with status under_review can be withdrawn',
    });

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Application successfully withdrawn',
    })
  );
});
