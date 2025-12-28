// import external modules
import { z } from 'zod';

// zod schema for createApplication
export const createApplicationSchema = z.object({
  body: z.object({
    applicantPitch: z
      .string()
      .trim()
      .nonempty({ error: 'applicantPitch is required' })
      .min(10, { error: 'applicantPitch must be at least 10 characters long' })
      .max(200, { error: 'applicantPitch must be at most 200 characters long' }),
    applicantSkills: z
      .array(
        z.object({
          skillName: z.string().trim().nonempty({ error: 'skillName is required' }),
          experienceInMonths: z.number().min(1, { error: 'experienceInMonths must be at least 1' }),
        })
      )
      .nonempty({ error: 'Atleast one applicantSkill is required' }),
    applicantResources: z
      .array(
        z.object({
          resourceName: z.string().trim().nonempty({ error: 'resourceName is required' }),
          resourceURL: z.url({ error: 'resourceURL must be a valid URL' }).trim(),
        })
      )
      .nonempty({ error: 'Atleast one applicantResource is required' }),
  }),
});
