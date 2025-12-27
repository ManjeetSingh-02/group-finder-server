// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { User } from '../../../models/index.js';
import { USER_ROLES } from '../../../utils/constants.js';

// @controller GET /profile
export const getUser = asyncHandler(async (req, res) => {
  // fetch user from db
  const existingUser = await User.findById(req.user.id)
    .select('_id email username role currentGroup userExpertise socialLinks')
    .populate('currentGroup', 'groupName')
    .populate({
      path: 'enrolledCohorts',
      select: '_id cohortName -allowedUserEmails',
    })
    .lean();
  if (!existingUser)
    throw new APIErrorResponse(404, {
      message: 'User not found',
    });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Fetched profile successfully',
      data: existingUser,
    })
  );
});

// @controller PATCH /
export const updateUserProfile = asyncHandler(async (req, res) => {
  // if no fields to update are present in the body, throw error
  if (!req.body.newUserExpertise && !req.body.newSocialLinks)
    throw new APIErrorResponse(400, {
      message: 'No fields are provided to update user profile',
    });

  // update user profile
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      userExpertise: req.body.newUserExpertise,
      socialLinks: req.body.newSocialLinks,
    },
    { runValidators: true, new: true }
  );

  // check if user was updated
  if (!updatedUser)
    throw new APIErrorResponse(500, {
      message: 'Failed to update profile',
    });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Profile updated successfully',
    })
  );
});

// @controller PATCH /update-role
export const updateUserRole = asyncHandler(async (req, res) => {
  // check if user is trying to update his own role
  if (req.user.email === req.body.userEmail)
    throw new APIErrorResponse(400, {
      message: 'You cannot update your own role',
    });

  // fetch user from db
  const existingUser = await User.findOne({ email: req.body.userEmail });
  if (!existingUser)
    throw new APIErrorResponse(404, {
      message: 'User not found',
    });

  // check if newRole is system_admin
  if (req.body.newRole === USER_ROLES.SYSTEM_ADMIN)
    throw new APIErrorResponse(403, {
      message: 'Only one system admin is allowed in the system',
    });

  // check if user has already the role
  if (existingUser.role === req.body.newRole)
    throw new APIErrorResponse(400, {
      message: `User already has the role of ${req.body.newRole}`,
    });

  // update user role
  existingUser.role = req.body.newRole;

  // save updated user to db
  await existingUser.save();

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'User role updated successfully',
    })
  );
});
