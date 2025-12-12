// import external modules
import mongoose from 'mongoose';

// schema for skill
const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    technologies: {
      type: [String],
      required: true,
      default: [],
    },
  },
  {
    _id: false,
  }
);

// schema for socialLink
const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    _id: false,
  }
);

// schema for user
const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
      trim: true,
      lowercase: true,
      minLength: 3,
      maxLength: 15,
    },
    skills: {
      type: [skillSchema],
      default: [],
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    currentGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    enrolledCohorts: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Cohort',
        },
      ],
      default: [],
    },
    auditLogs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'AuditLog',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// export user model
export const User = mongoose.model('User', userSchema);
