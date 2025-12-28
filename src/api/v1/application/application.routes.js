// import local modules
import {
  acceptApplication,
  createApplication,
  rejectApplication,
  withdrawApplication,
} from './application.controllers.js';
import {
  doesApplicationExistInGroup,
  isUserAlreadyInAGroup,
  isUserGroupAdmin,
  userAlreadyHasAPendingApplication,
  validateSchema,
} from '../../../utils/route-protectors/index.js';
import { createApplicationSchema } from './application.zodschemas.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router({ mergeParams: true });

// @route POST /
router.post(
  '/',
  isUserAlreadyInAGroup,
  userAlreadyHasAPendingApplication,
  validateSchema(createApplicationSchema),
  createApplication
);

// @route PATCH /accept
router.patch('/accept', isUserGroupAdmin, acceptApplication);

// @route PATCH /reject
router.patch('/reject', isUserGroupAdmin, rejectApplication);

// @route PATCH /withdraw
router.patch('/withdraw', doesApplicationExistInGroup, withdrawApplication);

// export router
export default router;
