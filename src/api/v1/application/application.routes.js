// import local modules
import {
  approveApplication,
  postApplication,
  denyApplication,
  withdrawApplication,
} from './application.controllers.js';
import {
  doesApplicationExistInGroup,
  isUserAlreadyInAGroup,
  isUserGroupAdmin,
  userAlreadyHasUnderReviewApplication,
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
  userAlreadyHasUnderReviewApplication,
  validateSchema(createApplicationSchema),
  postApplication
);

// @route PATCH /:applicationID/approve
router.patch(
  '/:applicationID/approve',
  doesApplicationExistInGroup,
  isUserGroupAdmin,
  approveApplication
);

// @route PATCH /:applicationID/deny
router.patch(
  '/:applicationID/deny',
  doesApplicationExistInGroup,
  isUserGroupAdmin,
  denyApplication
);

// @route PATCH /:applicationID/withdraw
router.patch('/:applicationID/withdraw', doesApplicationExistInGroup, withdrawApplication);

// export router
export default router;
