// import local modules
import {
  createGroup,
  deleteGroup,
  getGroupDetails,
  leaveGroup,
  removeGroupMember,
  updateGroupAnnouncement,
  updateGroupRoleRequirements,
} from './group.controllers.js';
import {
  isUserAlreadyInAGroup,
  isUserAllowedInGroup,
  validateSchema,
  isUserGroupAdmin,
  doesGroupExistInCohort,
  userAlreadyHasUnderReviewApplication,
} from '../../../utils/route-protectors/index.js';
import {
  createGroupSchema,
  removeGroupMemberSchema,
  updateGroupAnnouncementSchema,
  updateGroupRoleRequirementsSchema,
} from './group.zodschemas.js';
import applicationRouter from '../application/application.routes.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router({ mergeParams: true });

// @route POST /
router.post(
  '/',
  isUserAlreadyInAGroup,
  userAlreadyHasUnderReviewApplication,
  validateSchema(createGroupSchema),
  createGroup
);

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

// @route PATCH /:groupName/announcement
router.patch(
  '/:groupName/announcement',
  doesGroupExistInCohort,
  isUserGroupAdmin,
  validateSchema(updateGroupAnnouncementSchema),
  updateGroupAnnouncement
);

// @route PATCH /:groupName/leave
router.patch('/:groupName/leave', doesGroupExistInCohort, isUserAllowedInGroup, leaveGroup);

// @route PATCH /:groupName/remove-member
router.patch(
  '/:groupName/remove-member',
  doesGroupExistInCohort,
  isUserGroupAdmin,
  validateSchema(removeGroupMemberSchema),
  removeGroupMember
);

// @route DELETE /:groupName
router.delete('/:groupName', doesGroupExistInCohort, isUserGroupAdmin, deleteGroup);

// @route /:groupName/applications
router.use('/:groupName/applications', doesGroupExistInCohort, applicationRouter);

// export router
export default router;
