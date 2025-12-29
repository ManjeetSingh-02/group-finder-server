// import external modules
import { z } from 'zod';

// zod schema for create cohort admin
export const createCohortAdminSchema = z.object({
  body: z.object({
    userEmail: z.email({ error: 'Valid userEmail is required' }).trim().toLowerCase(),
  }),
});

// zod schema for update user professionalProfiles
export const updateUserProfessionalProfilesSchema = z.object({
  body: z.object({
    newProfessionalProfiles: z
      .array(
        z.object({
          platformName: z
            .string()
            .nonempty({ error: 'Atleast one platformName is required' })
            .trim(),
          platformURL: z.url({ error: 'Valid platformURL is required' }).trim(),
        })
      )
      .optional(),
  }),
});
