// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIResponse } from '../../response.api.js';
import { APIError } from '../../error.api.js';
import { User } from '../../../models/index.js';

// @controller GET /
export const getAllUsers = asyncHandler(async (_, res) => {
  // fetch all users from the database
  const existingUsers = await User.find({})
    .select('_id email username role currentGroup enrolledCohorts userExpertise socialLinks')
    .populate('currentGroup', 'groupName')
    .populate('enrolledCohorts', 'cohortName')
    .lean();

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Fetched all users successfully',
      data: existingUsers,
    })
  );
});

// @controller GET /profile
export const getUser = asyncHandler(async (req, res) => {
  // fetch user from db
  const existingUser = await User.findById(req.user.id)
    .select('_id email username role currentGroup enrolledCohorts userExpertise socialLinks')
    .populate('currentGroup', 'groupName')
    .populate('enrolledCohorts', 'cohortName');
  if (!existingUser)
    throw new APIError(404, {
      message: 'User not found',
    });

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'Fetched profile successfully',
      data: existingUser,
    })
  );
});

// @controller PATCH /role
export const updateUserRole = asyncHandler(async (req, res) => {
  // check if user is trying to update his own role
  if (req.user.email === req.body.userEmail)
    throw new APIError(400, {
      message: 'You cannot update your own role',
    });

  // fetch user from db
  const existingUser = await User.findOne({ email: req.body.userEmail });
  if (!existingUser)
    throw new APIError(404, {
      message: 'User not found',
    });

  // check if user has already the role
  if (existingUser.role === req.body.newRole)
    throw new APIError(400, {
      message: `User already has the role of ${req.body.newRole}`,
    });

  // update user role
  existingUser.role = req.body.newRole;

  // save updated user to db
  await existingUser.save();

  // send success status to user
  return res.status(200).json(
    new APIResponse(200, {
      message: 'User role updated successfully',
    })
  );
});
