// import local modules
import {
  USER_ROLES,
  availableUserRoles,
  ACCESS_TOKEN_LIFETIME,
  REFRESH_TOKEN_LIFETIME,
} from '../utils/constants.js';
import { envConfig } from '../utils/env.js';

// import external modules
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// helper function: if user is system_admin/cohort_admin, googleID is not required
function isFieldRequired() {
  return !(this.role === USER_ROLES.SYSTEM_ADMIN || this.role === USER_ROLES.COHORT_ADMIN);
}

// schema for professionalProfile
const professionalProfileSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      required: true,
      trim: true,
    },
    platformURL: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// schema for user
const userSchema = new mongoose.Schema(
  {
    googleID: {
      type: String,
      required: isFieldRequired,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 15,
    },
    professionalProfiles: {
      type: [professionalProfileSchema],
      default: [],
    },
    role: {
      type: String,
      enum: availableUserRoles,
      default: USER_ROLES.STUDENT,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    currentGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// method to generateAccessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, envConfig.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });
};

// method to generateRefreshToken
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, envConfig.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFETIME,
  });
};

// virtual field to get all cohorts the user is enrolled in
userSchema.virtual('enrolledCohorts', {
  ref: 'Cohort',
  localField: 'email',
  foreignField: 'allowedUserEmails',
});

// set virtuals to be included in toObject and toJSON outputs
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// export user model
export default mongoose.model('User', userSchema);
