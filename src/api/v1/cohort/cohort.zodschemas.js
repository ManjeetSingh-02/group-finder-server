// import external modules
import { z } from 'zod';
import { CSV_UPLOAD_CONFIG } from '../../../utils/constants.js';

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
  files: z
    .array(
      z.object({
        fieldname: z.literal(CSV_UPLOAD_CONFIG.FIELD_NAME),
        originalname: z.string().trim().nonempty({ error: 'originalname is required' }),
        encoding: z.string().trim().nonempty({ error: 'encoding is required' }),
        mimetype: z.literal(CSV_UPLOAD_CONFIG.ALLOWED_MIME_TYPE),
        buffer: z.instanceof(Buffer),
        size: z.number().max(CSV_UPLOAD_CONFIG.MAX_FILE_SIZE),
      })
    )
    .min(CSV_UPLOAD_CONFIG.MIN_FILE_COUNT, {
      error: `At least ${CSV_UPLOAD_CONFIG.MIN_FILE_COUNT} CSV file is required`,
    })
    .max(CSV_UPLOAD_CONFIG.MAX_FILE_COUNT, {
      error: `At most ${CSV_UPLOAD_CONFIG.MAX_FILE_COUNT} CSV files are allowed`,
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
