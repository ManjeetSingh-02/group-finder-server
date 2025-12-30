// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Application, Group } from '../../../models/index.js';
import { runInTransaction } from '../../../utils/db.js';

// @controller POST /
export const postApplication = asyncHandler(async (req, res) => {
  // run the application creation in a transaction session
  await runInTransaction(async mongooseSession => {
    // fetch group from db
    const existingGroup = await Group.findById(req.group.id)
      .session(mongooseSession)
      .select('createdBy maximumMembersCount groupMembersCount')
      .lean();

    // check if user is trying to apply to their own group
    if (String(existingGroup.createdBy) === String(req.user.id))
      throw new APIErrorResponse(400, {
        type: 'Create Application Error',
        message: 'Group creators cannot apply to their own groups',
      });

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
          cohortID: req.cohort.id,
          groupID: req.group.id,
          applicantDetails: {
            applicantID: req.user.id,
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

// @controller PATCH /:applicationID/approve
export const approveApplication = asyncHandler(async (req, res) => {});

// @controller PATCH /:applicationID/deny
export const denyApplication = asyncHandler(async (req, res) => {});

// @controller PATCH /:applicationID/withdraw
export const withdrawApplication = asyncHandler(async (req, res) => {});
