// import external modules
import { z } from 'zod';

// zod schema for createGroup
export const createGroupSchema = z.object({
  body: z.object({
    groupName: z
      .string()
      .trim()
      .nonempty({ error: 'groupName is required' })
      .min(5, { error: 'groupName must be at least 5 characters long' })
      .max(20, { error: 'groupName must be at most 20 characters long' }),
  }),
});

// zod schema for updateGroupRoleRequirements
export const updateGroupRoleRequirementsSchema = z.object({
  body: z.object({
    newRoleRequirements: z.array(
      z.object({
        roleName: z.string().trim().nonempty({ error: 'Atleast one roleName is required' }),
        techStack: z
          .array(
            z.object({
              skillName: z.string().trim().nonempty({ error: 'Atleast one skillName is required' }),
              experienceInMonths: z
                .number()
                .min(1, { error: 'experienceInMonths must be at least 1' }),
              isMandatory: z.boolean(),
            })
          )
          .nonempty({ error: 'At least one techStack item is required' }),
      })
    ),
  }),
});

// zod schema for updateGroupAnnouncement
export const updateGroupAnnouncementSchema = z.object({
  body: z.object({
    newAnnouncement: z.object({
      announcementText: z
        .string()
        .trim()
        .nonempty({ error: 'announcementText is required' })
        .min(10, { error: 'announcementText must be at least 10 characters long' })
        .max(500, { error: 'announcementText must be at most 500 characters long' }),
      announcementResources: z
        .array(
          z.object({
            resourceName: z
              .string()
              .trim()
              .nonempty({ error: 'Atleast one resourceName is required' }),
            resourceURL: z.url({ error: 'Valid resourceURL is required' }).trim(),
          })
        )
        .optional(),
    }),
  }),
});

// zod schema for removeGroupMember
export const removeGroupMemberSchema = z.object({
  body: z.object({
    memberEmail: z.email({ error: 'Valid memberEmail is required' }).trim().toLowerCase(),
  }),
});
