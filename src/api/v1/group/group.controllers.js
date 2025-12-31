// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Application, Group, User } from '../../../models/index.js';
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
      '_id groupName createdBy groupMembersCount maximumMembersCount roleRequirements groupAnnouncement'
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
      roleRequirements: req.body.newRoleRequirements,
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

// @controller PATCH /:groupName/announcement
export const updateGroupAnnouncement = asyncHandler(async (req, res) => {
  // push new announcement group's announcement array field
  const updatedGroup = await Group.findByIdAndUpdate(
    req.group.id,
    {
      groupAnnouncement: req.body.newAnnouncement,
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

// @controller PATCH /:groupName/leave
export const leaveGroup = asyncHandler(async (req, res) => {
  // check if user is creator of the group
  if (String(req.group.createdBy) === String(req.user.id))
    throw new APIErrorResponse(400, {
      type: 'Leave Group Error',
      message: 'Group creator cannot leave the group, please delete the group instead',
    });

  // run the group leave process in a transaction session
  await runInTransaction(async mongooseSession => {
    // update user's current group to null
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user.id,
        currentGroup: req.group.id,
      },
      { currentGroup: null },
      { session: mongooseSession, new: true }
    );
    if (!updatedUser)
      throw new APIErrorResponse(400, {
        type: 'Leave Group Error',
        message: 'User is not a member of this group',
      });

    // update group by decrementing group members count by 1
    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: req.group.id,
        groupMembersCount: { $gt: 0 },
      },
      { $inc: { groupMembersCount: -1 } },
      { session: mongooseSession, new: true }
    );
    if (!updatedGroup)
      throw new APIErrorResponse(400, {
        type: 'Leave Group Error',
        message: 'Something went wrong while updating the group members count',
      });
  });

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Left group successfully',
    })
  );
});

// @controller PATCH /:groupName/remove-member
export const removeGroupMember = asyncHandler(async (req, res) => {
  // run the remove group member process in a transaction session
  await runInTransaction(async mongooseSession => {
    // update user's current group to null
    const updatedUser = await User.findOneAndUpdate(
      {
        email: req.body.memberEmail,
        currentGroup: req.group.id,
      },
      { currentGroup: null },
      { session: mongooseSession, new: true }
    );
    if (!updatedUser)
      throw new APIErrorResponse(400, {
        type: 'Remove Member Error',
        message: 'User is not a member of this group',
      });

    // check if user is creator of the group
    if (String(req.group.createdBy) === String(updatedUser._id))
      throw new APIErrorResponse(400, {
        type: 'Remove Member Error',
        message: 'Group creator cannot be removed from the group, please delete the group instead',
      });

    // update group by decrementing group members count by 1
    const updatedGroup = await Group.findOneAndUpdate(
      {
        _id: req.group.id,
        groupMembersCount: { $gt: 0 },
      },
      { $inc: { groupMembersCount: -1 } },
      { session: mongooseSession, new: true }
    );
    if (!updatedGroup)
      throw new APIErrorResponse(400, {
        type: 'Remove Member Error',
        message: 'Something went wrong while updating the group members count',
      });
  });

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Removed member from group successfully',
    })
  );
});

// @controller DELETE /:groupName
export const deleteGroup = asyncHandler(async (req, res) => {
  // run the group deletion in a transaction session
  await runInTransaction(async mongooseSession => {
    // update all group member's current group to null
    await User.updateMany(
      { currentGroup: req.group.id },
      { currentGroup: null },
      { session: mongooseSession }
    );

    // delete all applications associated with the group
    await Application.deleteMany({ associatedGroup: req.group.id }, { session: mongooseSession });

    // delete the group
    const deletedGroup = await Group.findByIdAndDelete(req.group.id, {
      session: mongooseSession,
    });
    if (!deletedGroup)
      throw new APIErrorResponse(400, {
        type: 'Delete Group Error',
        message: 'Something went wrong while deleting the group',
      });
  });

  // send success response to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Group deleted successfully',
    })
  );
});
