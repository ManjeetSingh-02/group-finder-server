// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Group, User } from '../../../models/index.js';
import { runInTransaction } from '../../../utils/db.js';

// @controller POST /
export const createGroup = asyncHandler(async (req, res) => {
  // run the group creation in a transaction session
  const newGroup = await runInTransaction(async mongooseSession => {
    // check if group with same name exists
    const existingGroup = await Group.findOne({
      groupName: req.body.groupName,
      associatedCohort: req.cohort.id,
    })
      .session(mongooseSession)
      .select('_id')
      .lean();
    if (existingGroup)
      throw new APIErrorResponse(409, {
        type: 'Create Group Error',
        message: 'Group with the same name already exists',
      });

    // create new group (model.create returns an array when used with session)
    const [createdGroup] = await Group.create(
      [
        {
          groupName: req.body.groupName,
          createdBy: req.user.id,
          associatedCohort: req.cohort.id,
        },
      ],
      { session: mongooseSession }
    );

    // update user's currentGroup field and save it
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { currentGroup: createdGroup._id },
      { session: mongooseSession, new: true }
    );
    if (!updatedUser)
      throw new APIErrorResponse(500, {
        type: 'Create Group Error',
        message: 'Something went wrong while updating the user currentGroup field',
      });

    // return the newly created group
    return createdGroup;
  });

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
