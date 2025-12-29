// import local modules
import { USER_ROLES } from '../../../utils/constants.js';
import {
  hasRequiredRole,
  doesCohortExist,
  isLoggedIn,
  isUserAllowedInCohort,
  validateSchema,
} from '../../../utils/route-protectors/index.js';
import {
  addUserToCohort,
  createCohort,
  getAllCohorts,
  getCohortDetails,
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
import { uploadCSVFiles } from '../../../utils/multer.js';
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

// @route GET /:cohortName
router.get('/:cohortName', isLoggedIn, doesCohortExist, isUserAllowedInCohort, getCohortDetails);

// @route PATCH /:cohortName/description
router.patch(
  '/:cohortName/description',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN, USER_ROLES.COHORT_ADMIN]),
  doesCohortExist,
  validateSchema(updateCohortDescriptionSchema),
  updateCohortDescription
);

// @route PATCH /:cohortName/process-csv
router.patch(
  '/:cohortName/process-csv',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN, USER_ROLES.COHORT_ADMIN]),
  doesCohortExist,
  uploadCSVFiles,
  validateSchema(processCSVandAddUsersToCohortSchema),
  processCSVandAddUsersToCohort
);

// @route PATCH /:cohortName/add-user
router.patch(
  '/:cohortName/add-user',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN, USER_ROLES.COHORT_ADMIN]),
  doesCohortExist,
  validateSchema(addUserToCohortSchema),
  addUserToCohort
);

// @route PATCH /:cohortName/remove-user
router.patch(
  '/:cohortName/remove-user',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN, USER_ROLES.COHORT_ADMIN]),
  doesCohortExist,
  validateSchema(removeUserFromCohortSchema),
  removeUserFromCohort
);

// @route /:cohortName/groups
router.use('/:cohortName/groups', isLoggedIn, doesCohortExist, isUserAllowedInCohort, groupRouter);

// export router
export default router;
