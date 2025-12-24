// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIResponse } from '../../response.api.js';
import { APIError } from '../../error.api.js';
import { Cohort, Group, User } from '../../../models/index.js';

// @controller GET /
export const getCohortDetailsandGroups = asyncHandler(async (req, res) => {
  // fetch cohort from db
  const existingCohort = await Cohort.findById(req.cohort.id)
    .select('_id cohortName cohortDescription createdBy associatedGroups')
    .populate('createdBy', '_id username')
    .populate({
      path: 'associatedGroups',
      select: '_id groupName createdBy groupMembersCount maximumMembersCount roleRequirements',
      populate: {
        path: 'createdBy',
        select: '_id username',
      },
    })
    .lean();
  if (!existingCohort)
    throw new APIError(404, {
      type: 'Cohort Fetch Error',
      message: 'Cohort not found',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Cohort details and associated groups fetched successfully',
      data: existingCohort,
    })
  );
});

// @controller POST /
export const createGroup = asyncHandler(async (req, res) => {
  // check if group with same name exists
  const existingGroup = await Group.findOne({
    groupName: req.body.groupName,
    associatedCohort: req.cohort.id,
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
    createdBy: req.user.id,
    currentGroupMembers: [req.user.id],
    associatedCohort: req.cohort.id,
  });
  if (!newGroup)
    throw new APIError(500, {
      type: 'Create Group Error',
      message: 'Something went wrong while creating the group',
    });

  // update user's currentGroup field and save it
  const existingUser = await User.findById(req.user.id).select('currentGroup');
  existingUser.currentGroup = newGroup._id;
  await existingUser.save();

  // update cohort's associatedGroups field and save it
  const existingCohort = await Cohort.findById(req.cohort.id).select('associatedGroups');
  existingCohort.associatedGroups.push(newGroup._id);
  await existingCohort.save();

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
  // fetch group from db
  const existingGroup = await Group.findById(req.group.id)
    .select(
      '_id groupName createdBy currentGroupMembers groupMembersCount maximumMembersCount roleRequirements'
    )
    .populate('createdBy', '_id username')
    .populate('currentGroupMembers', '_id username')
    .lean();

  if (!existingGroup)
    throw new APIError(404, {
      type: 'Group Fetch Error',
      message: 'Group not found',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Group details fetched successfully',
      data: existingGroup,
    })
  );
});

// @controller PATCH /:groupName
export const updateGroupRoleRequirements = asyncHandler(async (req, res) => {
  // check if user has permission to update group
  if (!req.group.groupAccess)
    throw new APIError(403, {
      type: 'Permission Denied',
      message: 'You do not have permission to update this group',
    });

  // update group's role requirements
  const updatedGroup = await Group.findByIdAndUpdate(
    req.group.id,
    {
      roleRequirements: req.body.roleRequirements,
    },
    { runValidators: true, new: true }
  );
  if (!updatedGroup)
    throw new APIError(500, {
      type: 'Update Group Error',
      message: 'Something went wrong while updating the group',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Group role requirements updated successfully',
    })
  );
});
