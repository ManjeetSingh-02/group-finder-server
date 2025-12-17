// import local modules
import { USER_ROLES } from '../../../utils/constants.js';
import { hasRequiredRole, isLoggedIn, validateSchema } from '../../../utils/route-protector.js';
import {
  createCohort,
  getAllCohorts,
  processCSVandAddUsersToCohort,
} from './cohort.controllers.js';
import { createCohortSchema, processCSVandAddUsersToCohortSchema } from './cohort.zodschemas.js';
import { uploadCSVFiles } from '../../../utils/process-csv.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @route POST /
router.post(
  '/',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  validateSchema(createCohortSchema),
  createCohort
);

// @route GET /
router.get('/', isLoggedIn, getAllCohorts);

// @route PATCH /:cohortName/process-csv
router.patch(
  '/:cohortName/process-csv',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  uploadCSVFiles,
  validateSchema(processCSVandAddUsersToCohortSchema),
  processCSVandAddUsersToCohort
);

// export router
export default router;
