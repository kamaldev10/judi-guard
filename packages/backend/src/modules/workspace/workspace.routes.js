import express from 'express';
import * as workspaceController from './workspace.controller.js';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';
import validateRequest from '#middlewares/validate-request.js';
import {
  inviteMemberSchema,
  assignRoleSchema,
  assignPermissionsSchema,
} from './workspace.validator.js';

const router = express.Router();

// Semua rute workspace mewajibkan autentikasi
router.use(requireAuth);

router.get(
  '/members',
  requirePermission('workspace:read'),
  workspaceController.getMembersController,
);

router.post(
  '/members',
  requirePermission('workspace:invite'),
  validateRequest(inviteMemberSchema, 'body'),
  workspaceController.inviteMemberController,
);

router.delete(
  '/members/:userId',
  requirePermission('workspace:remove'),
  workspaceController.removeMemberController,
);

router.patch(
  '/members/:userId/role',
  requirePermission('workspace:assign-role'),
  validateRequest(assignRoleSchema, 'body'),
  workspaceController.assignRoleController,
);

router.patch(
  '/members/:userId/permissions',
  requirePermission('rbac:assign-permission'),
  validateRequest(assignPermissionsSchema, 'body'),
  workspaceController.assignPermissionsController,
);

export default router;
