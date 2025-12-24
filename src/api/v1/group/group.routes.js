// import local modules
import {
  createGroup,
  getCohortDetailsandGroups,
  getGroupDetails,
  updateGroupRoleRequirements,
} from './group.controllers.js';
import {
  isUserAlreadyInAGroup,
  isUserAllowedInGroup,
  validateSchema,
} from '../../../utils/route-protector.js';
import { createGroupSchema, updateGroupRoleRequirementsSchema } from './group.zodschemas.js';

// import external modules
import { Router } from 'express';

// create a new router
const router = Router({ mergeParams: true });

// @route GET /
router.get('/', getCohortDetailsandGroups);

// @route POST /
router.post('/', isUserAlreadyInAGroup, validateSchema(createGroupSchema), createGroup);

// @route GET /:groupName
router.get('/:groupName', isUserAllowedInGroup, getGroupDetails);

// @route PATCH /:groupName
router.patch(
  '/:groupName',
  isUserAllowedInGroup,
  validateSchema(updateGroupRoleRequirementsSchema),
  updateGroupRoleRequirements
);

// export router
export default router;
