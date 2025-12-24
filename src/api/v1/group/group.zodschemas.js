// import external modules
import { z } from 'zod';

// zod schema for createGroup
export const createGroupSchema = z.object({
  body: z.object({
    groupName: z
      .string()
      .trim()
      .nonempty({ message: 'groupName is required' })
      .min(5, { message: 'groupName must be at least 5 characters long' })
      .max(50, { message: 'groupName must be at most 50 characters long' }),
  }),
});

// zod schema for updateGroupRoleRequirements
export const updateGroupRoleRequirementsSchema = z.object({
  params: z.object({
    groupName: z.string().trim().nonempty({ message: 'groupName is required' }),
  }),
  body: z.object({
    roleRequirements: z.array(
      z.object({
        roleName: z.string().trim().min(1, { message: 'roleName is required' }),
        techStack: z
          .array(
            z.object({
              skillName: z.string().trim().min(1, { message: 'skillName is required' }),
              minimumExperienceInMonths: z.number().min(0),
              isMandatory: z.boolean(),
            })
          )
          .min(1, { message: 'At least one techStack item is required' }),
      })
    ),
  }),
});
