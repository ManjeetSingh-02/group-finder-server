// import local modules
import { USER_ROLES } from '../../../utils/constants.js';
import {
  hasRequiredRole,
  isLoggedIn,
  validateSchema,
} from '../../../utils/route-protectors/index.js';
import { createCohortAdmin, getUser, updateUserProfessionalProfiles } from './user.controllers.js';
import {
  createCohortAdminSchema,
  updateUserProfessionalProfilesSchema,
} from './user.zodschemas.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @route GET /profile
router.get('/profile', isLoggedIn, getUser);

// @route PATCH /update-professional-profiles
router.patch(
  '/update-professional-profiles',
  isLoggedIn,
  validateSchema(updateUserProfessionalProfilesSchema),
  updateUserProfessionalProfiles
);

// @route PATCH /create-cohort-admin
router.patch(
  '/create-cohort-admin',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  validateSchema(createCohortAdminSchema),
  createCohortAdmin
);

// export router
export default router;
