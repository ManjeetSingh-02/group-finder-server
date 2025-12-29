// import external modules
import { z } from 'zod';

// zod schema for cohortName
const cohortNameSchema = z
  .string()
  .trim()
  .nonempty({ error: 'cohortName is required' })
  .min(10, { error: 'cohortName must be at least 10 characters long' })
  .max(30, { error: 'cohortName must be at most 30 characters long' });

// zod schema for cohortDescription
const cohortDescriptionSchema = z
  .string()
  .trim()
  .nonempty({ error: 'cohortDescription is required' })
  .min(10, { error: 'cohortDescription must be at least 10 characters long' })
  .max(200, { error: 'cohortDescription must be at most 200 characters long' });

// zod schema for createCohort
export const createCohortSchema = z.object({
  body: z.object({
    cohortName: cohortNameSchema,
    cohortDescription: cohortDescriptionSchema,
  }),
});

// zod schema for processCSVandAddUsersToCohort
export const processCSVandAddUsersToCohortSchema = z.object({
  files: z.object({
    csvFiles: z
      .array(z.any())
      .min(1, { error: 'At least 1 CSV file is required' })
      .max(5, { error: 'At most 5 CSV files are allowed' }),
  }),
});

// zod schema for addUserToCohort
export const addUserToCohortSchema = z.object({
  body: z.object({
    userEmail: z.email({ error: 'Valid userEmail is required' }).trim().toLowerCase(),
  }),
});

// zod schema for removeUserFromCohort
export const removeUserFromCohortSchema = z.object({
  body: z.object({
    userEmail: z.email({ error: 'Valid userEmail is required' }).trim().toLowerCase(),
  }),
});

// zod schema for updateCohortDescription
export const updateCohortDescriptionSchema = z.object({
  body: z.object({
    cohortDescription: cohortDescriptionSchema,
  }),
});
