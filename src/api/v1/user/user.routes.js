// import local modules
import { USER_ROLES } from '../../../utils/constants.js';
import { hasRequiredRole, isLoggedIn, validateSchema } from '../../../utils/route-protector.js';
import { getAllUsers, getUser, updateUserProfile, updateUserRole } from './user.controllers.js';
import { updateUserProfileSchema, updateUserRoleSchema } from './user.zodschemas.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router();

// @route GET /
router.get('/', isLoggedIn, hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]), getAllUsers);

// @route GET /profile
router.get('/profile', isLoggedIn, getUser);

// @route PATCH /
router.patch('/', isLoggedIn, validateSchema(updateUserProfileSchema), updateUserProfile);

// @route PATCH /update-role
router.patch(
  '/update-role',
  isLoggedIn,
  hasRequiredRole([USER_ROLES.SYSTEM_ADMIN]),
  validateSchema(updateUserRoleSchema),
  updateUserRole
);

// export router
export default router;
