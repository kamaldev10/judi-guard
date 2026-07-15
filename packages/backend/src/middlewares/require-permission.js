import { ForbiddenError } from '#shared/utils/errors.js';

// Default permissions per role sesuai matriks spesifikasi
const DEFAULT_PERMISSIONS = {
  superuser: [
    'profile:read',
    'profile:write',
    'analysis:start',
    'analysis:read',
    'analysis:moderate',
    'analysis:report',
    'config:read',
    'config:write',
    'channel:read',
    'youtube:connect',
    'workspace:read',
    'workspace:invite',
    'workspace:remove',
    'workspace:assign-role',
    'workspace:create',
    'rbac:assign-permission',
    'rbac:revoke-permission',
  ],
  owner: [
    'profile:read',
    'profile:write',
    'analysis:start',
    'analysis:read',
    'analysis:moderate',
    'analysis:report',
    'config:read',
    'config:write',
    'channel:read',
    'youtube:connect',
    'workspace:read',
    'workspace:invite',
    'workspace:remove',
    'workspace:assign-role',
    'rbac:assign-permission',
    'rbac:revoke-permission',
  ],
  admin: [
    'profile:read',
    'profile:write',
    'analysis:start',
    'analysis:read',
    'analysis:moderate',
    'analysis:report',
    'config:read',
    'config:write',
    'channel:read',
    'youtube:connect',
    'workspace:read',
  ],
  member: [
    'profile:read',
    'profile:write',
    'analysis:start',
    'analysis:read',
    'analysis:moderate',
    'analysis:report',
    'config:read',
    'channel:read',
    'youtube:connect',
  ],
  explorer: [
    'profile:read',
    'profile:write',
    'analysis:start',
    'analysis:read',
    'analysis:moderate',
    'analysis:report',
    'config:read',
    'channel:read',
    'youtube:connect',
  ],
};

/**
 * Memeriksa apakah user memiliki suatu permission tertentu.
 * Evaluasi (Fase 2):
 * 1. Cek override eksplisit (deny lalu grant) di WorkspaceMember.
 * 2. Fallback ke default role di WorkspaceMember.
 */
const hasPermission = (membership, permission) => {
  if (!membership) return false;

  // 1. Cek override eksplisit (deny & grant) di membership
  if (membership.permissionOverrides?.deny?.includes(permission)) {
    return false;
  }
  if (membership.permissionOverrides?.grant?.includes(permission)) {
    return true;
  }

  // 2. Fallback ke default role
  const role = membership.role || 'member';
  const rolePermissions = DEFAULT_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Middleware requirePermission:
 * Memastikan user memiliki semua permission yang dikirim sebagai argumen.
 * Jika salah satu permission tidak dipenuhi, return 403 Forbidden.
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    // req.membership dipasang oleh requireAuth sebelumnya, fallback ke req.auth jika tidak ada
    const context = req.membership || req.auth;
    if (!context) {
      return next(new ForbiddenError('Akses ditolak untuk aksi ini'));
    }

    const hasAll = permissions.every((perm) => hasPermission(context, perm));
    if (!hasAll) {
      return next(new ForbiddenError('Akses ditolak untuk aksi ini'));
    }

    next();
  };
};

export default requirePermission;
