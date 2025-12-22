// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIResponse } from '../../response.api.js';
import { APIError } from '../../error.api.js';
import { Group } from '../../../models/index.js';

// @controller GET /
export const getCohortDetailsandGroups = asyncHandler(async (req, res) => {
  // populate group info for response
  const populatedCohortData = await req.cohort.populate([
    {
      path: 'createdBy',
      select: '_id username',
    },
    {
      path: 'associatedGroups',
      select: '_id groupName createdBy groupMembersCount maximumMembersCount roleRequirements',
      populate: {
        path: 'createdBy',
        select: '_id username',
      },
    },
  ]);

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Cohort details and associated groups fetched successfully',
      data: {
        cohortID: req.cohort._id,
        cohortName: req.cohort.cohortName,
        cohortDescription: req.cohort.cohortDescription,
        createdBy: populatedCohortData.createdBy,
        associatedGroups: populatedCohortData.associatedGroups,
      },
    })
  );
});

// @controller POST /
export const createGroup = asyncHandler(async (req, res) => {
  // check if group with same name exists
  const existingGroup = await Group.findOne({
    groupName: req.body.groupName,
    associatedCohort: req.cohort._id,
  })
    .select('_id')
    .lean();
  if (existingGroup)
    throw new APIError(409, {
      type: 'Create Group Error',
      message: 'Group with the same name already exists',
    });

  // create new group
  const newGroup = await Group.create({
    groupName: req.body.groupName,
    createdBy: req.user._id,
    currentGroupMembers: [req.user._id],
    associatedCohort: req.cohort._id,
  });
  if (!newGroup)
    throw new APIError(500, {
      type: 'Create Group Error',
      message: 'Something went wrong while creating the group',
    });

  // update user's currentGroup field and save it
  req.user.currentGroup = newGroup._id;
  await req.user.save();

  // update cohort's associatedGroups field and save it
  req.cohort.associatedGroups.push(newGroup._id);
  await req.cohort.save();

  // send success status to user
  return res.status(201).json(
    new APIResponse(201, {
      message: 'Group created successfully',
      data: { newGroupName: newGroup.groupName },
    })
  );
});

// @controller GET /:groupName
export const getGroupDetails = asyncHandler(async (req, res) => {
  // populate group details for response
  const populatedGroupData = await req.group.populate([
    {
      path: 'createdBy',
      select: '_id username',
    },
    {
      path: 'currentGroupMembers',
      select: '_id username',
    },
  ]);

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Group details fetched successfully',
      data: populatedGroupData.toObject(),
    })
  );
});
