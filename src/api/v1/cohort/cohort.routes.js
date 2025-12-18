// import local modules
import { USER_ROLES } from '../../../utils/constants.js';
import {
  hasRequiredRole,
  isCohortValid,
  isLoggedIn,
  isUserAllowedInCohort,
  validateSchema,
} from '../../../utils/route-protector.js';
import {
  addUserToCohort,
  createCohort,
  getAllCohorts,
  processCSVandAddUsersToCohort,
  removeUserFromCohort,
  updateCohortDescription,
} from './cohort.controllers.js';
import {
  addUserToCohortSchema,
  createCohortSchema,
  processCSVandAddUsersToCohortSchema,
  removeUserFromCohortSchema,
  updateCohortDescriptionSchema,
} from './cohort.zodschemas.js';
import { uploadCSVFiles } from '../../../utils/process-csv.js';
import groupRouter from '../group/group.routes.js';

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

// @route PATCH /:cohortName/description
router.patch(
  '/:cohortName/description',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  isCohortValid,
  validateSchema(updateCohortDescriptionSchema),
  updateCohortDescription
);

// @route PATCH /:cohortName/process-csv
router.patch(
  '/:cohortName/process-csv',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  isCohortValid,
  uploadCSVFiles,
  validateSchema(processCSVandAddUsersToCohortSchema),
  processCSVandAddUsersToCohort
);

// @route PATCH /:cohortName/add-user
router.patch(
  '/:cohortName/add-user',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  isCohortValid,
  validateSchema(addUserToCohortSchema),
  addUserToCohort
);

// @route PATCH /:cohortName/remove-user
router.patch(
  '/:cohortName/remove-user',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  isCohortValid,
  validateSchema(removeUserFromCohortSchema),
  removeUserFromCohort
);

// @route /:cohortName/group
router.use('/:cohortName/group', isLoggedIn, isCohortValid, isUserAllowedInCohort, groupRouter);

// export router
export default router;
