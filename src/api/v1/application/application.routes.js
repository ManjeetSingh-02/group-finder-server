// import local modules
import {
  approveApplication,
  postApplication,
  denyApplication,
  withdrawApplication,
  getAllGroupApplications,
} from './application.controllers.js';
import {
  canUserWithdrawApplication,
  doesApplicationExistInGroup,
  isApplicationNotUnderReview,
  isUserAlreadyInAGroup,
  isUserGroupAdmin,
  userAlreadyHasUnderReviewApplication,
  validateSchema,
} from '../../../utils/route-protectors/index.js';
import {
  approveOrDenyApplicationSchema,
  createApplicationSchema,
} from './application.zodschemas.js';

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

// @route GET /
router.get('/', isUserGroupAdmin, getAllGroupApplications);

// @route PATCH /:applicationID/approve
router.patch(
  '/:applicationID/approve',
  doesApplicationExistInGroup,
  isApplicationNotUnderReview,
  isUserGroupAdmin,
  validateSchema(approveOrDenyApplicationSchema),
  approveApplication
);

// @route PATCH /:applicationID/deny
router.patch(
  '/:applicationID/deny',
  doesApplicationExistInGroup,
  isApplicationNotUnderReview,
  isUserGroupAdmin,
  validateSchema(approveOrDenyApplicationSchema),
  denyApplication
);

// @route PATCH /:applicationID/withdraw
router.patch(
  '/:applicationID/withdraw',
  doesApplicationExistInGroup,
  isApplicationNotUnderReview,
  canUserWithdrawApplication,
  withdrawApplication
);

// export router
export default router;
