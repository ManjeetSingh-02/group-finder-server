// import local modules
import { MAX_GROUP_MEMBERS } from '../utils/constants.js';

// import external modules
import mongoose from 'mongoose';

// schema for tech stack
const techStackSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    experienceInMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    isMandatory: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

// schema for role requirement
const roleRequirementSchema = new mongoose.Schema(
  {
    roleName: {
      type: String,
      required: true,
      trim: true,
    },
    techStack: {
      type: [techStackSchema],
      required: true,
    },
  },
  { _id: false }
);

// schema for group announcements
const announcementSchema = new mongoose.Schema(
  {
    announcementText: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 500,
    },
    announcementResources: {
      type: [
        {
          resourceName: {
            type: String,
            required: true,
            trim: true,
          },
          resourceURL: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      default: [],
    },
  },
  { _id: false, timestamps: true }
);

// schema for group
const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
      minLength: 5,
      maxLength: 20,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    currentGroupMembers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      required: true,
    },
    groupMembersCount: {
      type: Number,
      default: 1,
    },
    maximumMembersCount: {
      type: Number,
      default: MAX_GROUP_MEMBERS,
    },
    roleRequirements: {
      type: [roleRequirementSchema],
      default: [],
    },
    groupAnnouncements: {
      type: [announcementSchema],
      default: [],
    },
    associatedApplications: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Application',
        },
      ],
      default: [],
    },
    associatedCohort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cohort',
      required: true,
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

// create index on groupName for faster search
groupSchema.index({ groupName: 1, associatedCohort: 1 }, { unique: true });

// export group model
export default mongoose.model('Group', groupSchema);
