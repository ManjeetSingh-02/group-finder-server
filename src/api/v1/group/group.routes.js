// import local modules
import {
  createGroup,
  getGroupDetails,
  updateGroupAnnouncements,
  updateGroupRoleRequirements,
} from './group.controllers.js';
import {
  isUserAlreadyInAGroup,
  isUserAllowedInGroup,
  validateSchema,
  isUserGroupAdmin,
  doesGroupExistInCohort,
} from '../../../utils/route-protectors/index.js';
import {
  createGroupSchema,
  updateGroupAnnouncementsSchema,
  updateGroupRoleRequirementsSchema,
} from './group.zodschemas.js';
import applicationRouter from '../application/application.routes.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router({ mergeParams: true });

// @route POST /
router.post('/', isUserAlreadyInAGroup, validateSchema(createGroupSchema), createGroup);

// @route GET /:groupName
router.get('/:groupName', doesGroupExistInCohort, isUserAllowedInGroup, getGroupDetails);

// @route PATCH /:groupName/role-requirements
router.patch(
  '/:groupName/role-requirements',
  doesGroupExistInCohort,
  isUserGroupAdmin,
  validateSchema(updateGroupRoleRequirementsSchema),
  updateGroupRoleRequirements
);

// @route PATCH /:groupName/announcements
router.patch(
  '/:groupName/announcements',
  doesGroupExistInCohort,
  isUserGroupAdmin,
  validateSchema(updateGroupAnnouncementsSchema),
  updateGroupAnnouncements
);

// @route /:groupName/applications
router.use('/:groupName/applications', doesGroupExistInCohort, applicationRouter);

// export router
export default router;
