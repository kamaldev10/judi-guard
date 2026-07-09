import express from 'express';
import requireAuth from '#middlewares/require-auth.js';
import requirePermission from '#middlewares/require-permission.js';
import * as userController from './user.controller.js';

const router = express.Router();

router.get('/me', requireAuth, requirePermission('profile:read'), userController.getMe);
router.patch('/updateMe', requireAuth, requirePermission('profile:write'), userController.updateMe);
router.delete('/deleteMe', requireAuth, requirePermission('profile:write'), userController.deleteMe);

export default router;
