// import external modules
import { z } from 'zod';

// zod schema for cohortName
const cohortNameSchema = z
  .string()
  .trim()
  .nonempty({ message: 'cohortName is required' })
  .min(10, { message: 'Username must be at least 10 characters long' })
  .max(50, { message: 'Username must be at most 50 characters long' });

// zod schema for cohortDescription
const cohortDescriptionSchema = z
  .string()
  .trim()
  .nonempty({ message: 'cohortDescription is required' })
  .min(20, { message: 'cohortDescription must be at least 20 characters long' })
  .max(200, { message: 'cohortDescription must be at most 200 characters long' });

// zod schema for createCohort
export const createCohortSchema = z.object({
  body: z.object({
    cohortName: cohortNameSchema,
    cohortDescription: cohortDescriptionSchema,
  }),
});

// zod schema for processCSVandAddUsersToCohort
export const processCSVandAddUsersToCohortSchema = z.object({
  params: z.object({
    cohortName: z.string().trim().nonempty({ message: 'cohortName is required' }),
  }),

  files: z.object({
    csvFiles: z
      .array(z.any())
      .min(1, { message: 'At least 1 CSV file is required' })
      .max(5, { message: 'At most 5 CSV files are allowed' }),
  }),
});
