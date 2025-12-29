// import local modules
import { asyncHandler } from '../../../utils/async-handler.js';
import { APIErrorResponse, APISuccessResponse } from '../../response.api.js';
import { Cohort, User } from '../../../models/index.js';
import { USER_ROLES } from '../../../utils/constants.js';

// @controller GET /profile
export const getUser = asyncHandler(async (req, res) => {
  // fetch user from db
  const existingUser = await User.findById(req.user.id)
    .select('_id email username role currentGroup professionalProfiles')
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

// @controller PATCH /update-professional-profiles
export const updateUserProfessionalProfiles = asyncHandler(async (req, res) => {
  // if no newProfessionalProfiles are present in the body, throw error
  if (!req.body.newProfessionalProfiles)
    throw new APIErrorResponse(400, {
      message: 'Atleast one professional profile is required to update',
    });

  // update user professionalProfiles
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      professionalProfiles: req.body.newProfessionalProfiles,
    },
    { runValidators: true, new: true }
  );

  // check if user was updated
  if (!updatedUser)
    throw new APIErrorResponse(500, {
      message: 'Failed to update user professional profiles',
    });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'ProfessionalProfiles updated successfully',
    })
  );
});

// @controller POST /cohort-admin
export const createCohortAdminUser = asyncHandler(async (req, res) => {
  // check if user with the given email already exists
  const existingUser = await User.findOne({ email: req.body.userEmail }).select('_id').lean();
  if (existingUser)
    throw new APIErrorResponse(400, {
      message: 'Another User with the given email already exists',
    });

  // run the cohort_admin user creation in a transaction session
  await runInTransaction(async mongooseSession => {
    // create the cohort_admin user
    await User.create(
      [
        {
          email: req.body.userEmail,
          username: `${req.body.userEmail.split('@')[0].slice(0, 10)}${generateRandomSuffix()}`,
          role: USER_ROLES.COHORT_ADMIN,
        },
      ],
      {
        session: mongooseSession,
      }
    );

    // update all cohorts to include this new user email in their allowedUserEmails
    await Cohort.updateMany(
      {},
      { $addToSet: { allowedUserEmails: req.body.userEmail } },
      { session: mongooseSession }
    );
  });

  // send success status to user
  return res.status(201).json(
    new APISuccessResponse(201, {
      message: 'Cohort Admin user created successfully and added to all cohorts',
    })
  );
});

// @controller DELETE /cohort-admin
export const deleteCohortAdminUser = asyncHandler(async (req, res) => {
  // run the cohort_admin user deletion in a transaction session
  await runInTransaction(async mongooseSession => {
    // delete the cohort_admin user
    const deletedUser = await User.deleteOne(
      { email: req.body.userEmail, role: USER_ROLES.COHORT_ADMIN },
      { session: mongooseSession }
    );
    if (deletedUser.deletedCount === 0)
      throw new APIErrorResponse(400, {
        message: 'No Cohort Admin user found with the given email',
      });

    // update all cohorts to remove userEmail in their allowedUserEmails
    await Cohort.updateMany(
      { allowedUserEmails: req.body.userEmail },
      { $pull: { allowedUserEmails: req.body.userEmail } },
      { session: mongooseSession }
    );
  });

  // send success status to user
  return res.status(200).json(
    new APISuccessResponse(200, {
      message: 'Cohort Admin user deleted successfully and removed from all cohorts',
    })
  );
});

// sub-function to generate a random suffix for username
function generateRandomSuffix() {
  return Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, '0');
}
