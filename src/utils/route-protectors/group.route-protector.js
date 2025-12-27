// import local modules
import { APIErrorResponse } from '../../api/response.api.js';
import { asyncHandler } from '../async-handler.js';
import { USER_ROLES } from '../constants.js';
import { Group } from '../../models/index.js';

// function to check if user is already in a group
export const isUserAlreadyInAGroup = asyncHandler(async (req, _, next) => {
  // if user is already in a group, throw an error
  if (req.user.currentGroup)
    throw new APIErrorResponse(409, {
      type: 'Group Membership Error',
      message: 'User is already in a group, cannot join another group',
    });

  // forward request to next middleware
  next();
});

// function to check if user is allowed in the group
export const isUserAllowedInGroup = asyncHandler(async (req, _, next) => {
  // fetch group from db
  const existingGroup = await Group.findOne({
    groupName: req.params.groupName,
    associatedCohort: req.cohort.id,
  })
    .select('_id createdBy')
    .lean();
  if (!existingGroup)
    throw new APIErrorResponse(404, {
      type: 'Group Validation Error',
      message: `Group '${req.params.groupName}' not found in this cohort`,
    });

  // check if user is system_admin or cohort_admin
  const isAdmin = [USER_ROLES.SYSTEM_ADMIN, USER_ROLES.COHORT_ADMIN].includes(req.user.role);

  // check if user role is student and not a part of group then throw an error
  if (req.user.role === USER_ROLES.STUDENT) {
    if (!req.user.currentGroup || String(req.user.currentGroup) !== String(existingGroup._id))
      throw new APIErrorResponse(403, {
        type: 'Group Authorization Error',
        message: `User is not a member of group '${req.params.groupName}'`,
      });
  }

  // if user is creator of the group, set admin access to true
  const isGroupCreator = existingGroup.createdBy.equals(req.user.id);

  // determine if user has group access
  const hasGroupAccess = isAdmin || isGroupCreator;

  // set group in request object with id and a flag indicating group access
  req.group = {
    id: existingGroup._id,
    groupAccess: hasGroupAccess,
  };

  // forward request to next middleware
  next();
});

// function to check if user has admin access to the group
export const isUserGroupAdmin = asyncHandler(async (req, _, next) => {
  // if user does not have group admin access, throw an error
  if (!req.group.groupAccess)
    throw new APIErrorResponse(403, {
      type: 'Group Admin Authorization Error',
      message: 'User does not have admin access for this group',
    });

  // forward request to next middleware
  next();
});
