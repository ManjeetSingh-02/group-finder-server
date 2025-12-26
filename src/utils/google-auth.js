// import local modules
import { Cohort, User } from '../models/index.js';
import { APIError } from '../api/error.api.js';

export async function handleGoogleLogin(userDetails) {
  // check if user is already registered
  const existingUser = await User.findOne({ email: userDetails.email }).select(
    'googleID refreshToken'
  );

  // --------------------------------------------------
  // LOGIN PATH: User is already registered
  // --------------------------------------------------

  // If user exists, check for any missing googleID (Mainly SYSTEM_ADMIN's) and update it
  if (existingUser) {
    if (!existingUser.googleID) {
      // update googleID in db
      existingUser.googleID = userDetails.googleID;

      // save user
      await existingUser.save();
    }

    return generateTokens(existingUser);
  }

  // --------------------------------------------------
  // REGISTRATION PATH: User is not registered
  // --------------------------------------------------

  // Check if user is allowed in any cohorts
  const allowedCohorts = await Cohort.find({
    allowedUserEmails: { $in: [userDetails.email] },
  })
    .select('_id')
    .lean();

  // if not allowed, throw error
  if (allowedCohorts.length === 0)
    throw new APIError(403, {
      type: 'Google Login Callback Error',
      message: 'You are not authorized to access this application.',
    });

  // create a new user in db
  const newUser = await User.create({
    googleID: userDetails.googleID,
    email: userDetails.email,
    username: `${userDetails.email.split('@')[0].slice(0, 10)}${generateRandomSuffix()}`,
    enrolledCohorts: allowedCohorts.map(cohort => cohort._id),
  });
  if (!newUser)
    throw new APIError(500, {
      type: 'Google Login Callback Error',
      message: 'Something went wrong while creating a new user.',
    });

  return generateTokens(newUser);
}

// sub-function to generate access and refresh tokens
async function generateTokens(user) {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // update refresh token in db
  user.refreshToken = refreshToken;

  // save user
  await user.save({ validateBeforeSave: false });

  // return access and refresh tokens
  return { accessToken, refreshToken };
}

// sub-function to generate a random suffix for username
function generateRandomSuffix() {
  return Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, '0');
}
