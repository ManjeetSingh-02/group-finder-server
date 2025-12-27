// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Group, User } from '../../../models/index.js';

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
    throw new APIErrorResponse(409, {
      type: 'Create Group Error',
      message: 'Group with the same name already exists',
    });

  // create new group
  const newGroup = await Group.create({
    groupName: req.body.groupName,
    createdBy: req.user.id,
    associatedCohort: req.cohort.id,
  });
  if (!newGroup)
    throw new APIErrorResponse(500, {
      type: 'Create Group Error',
      message: 'Something went wrong while creating the group',
    });

  // update user's currentGroup field and save it
  const existingUser = await User.findById(req.user.id).select('currentGroup');
  existingUser.currentGroup = newGroup._id;
  await existingUser.save({ validateBeforeSave: false });

  // send success status to user
  return res.status(201).json(
    new APISuccessResponse(201, {
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
      '_id groupName createdBy groupMembersCount maximumMembersCount roleRequirements groupAnnouncements'
    )
    .populate('createdBy', '_id username')
    .populate({
      path: 'currentGroupMembers',
      select: '_id username -currentGroup',
    })
    .lean();

  if (!existingGroup)
    throw new APIErrorResponse(404, {
      type: 'Group Fetch Error',
      message: 'Group not found',
    });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Group details fetched successfully',
      data: existingGroup,
    })
  );
});

// @controller PATCH /:groupName/role-requirements
export const updateGroupRoleRequirements = asyncHandler(async (req, res) => {
  // check if user has permission to update group
  if (!req.group.groupAccess)
    throw new APIErrorResponse(403, {
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
    throw new APIErrorResponse(500, {
      type: 'Update Group Error',
      message: 'Something went wrong while updating the group',
    });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Group role requirements updated successfully',
    })
  );
});

// @controller PATCH /:groupName/announcements
export const updateGroupAnnouncements = asyncHandler(async (req, res) => {
  // check if user has permission to post announcement
  if (!req.group.groupAccess)
    throw new APIErrorResponse(403, {
      type: 'Permission Denied',
      message: 'You do not have permission to post announcement in this group',
    });

  // push new announcement group's announcement array field
  const updatedGroup = await Group.findByIdAndUpdate(
    req.group.id,
    {
      $push: { groupAnnouncements: req.body.newAnnouncement },
    },
    { runValidators: true, new: true }
  );
  if (!updatedGroup)
    throw new APIErrorResponse(500, {
      type: 'Update Announcement Error',
      message: 'Something went wrong while posting the announcement',
    });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Group announcement posted successfully',
    })
  );
});
