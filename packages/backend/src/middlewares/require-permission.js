import { ForbiddenError } from '#shared/utils/errors.js';

// Default permissions per role sesuai matriks spesifikasi
const DEFAULT_PERMISSIONS = {
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
};

/**
 * Memeriksa apakah user memiliki suatu permission tertentu.
 * Evaluasi:
 * 1. Cek override eksplisit (deny lalu grant).
 * 2. Fallback ke default role.
 */
const hasPermission = (user, permission) => {
  if (!user) return false;

  // 1. Cek override eksplisit (deny & grant) di User model
  if (user.permissionOverrides?.deny?.includes(permission)) {
    return false;
  }
  if (user.permissionOverrides?.grant?.includes(permission)) {
    return true;
  }

  // 2. Fallback ke default role
  const role = user.role || 'member';
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
    // req.user dipasang oleh requireAuth sebelumnya
    if (!req.user) {
      return next(new ForbiddenError('Akses ditolak untuk aksi ini'));
    }

    const hasAll = permissions.every((perm) => hasPermission(req.user, perm));
    if (!hasAll) {
      return next(new ForbiddenError('Akses ditolak untuk aksi ini'));
    }

    next();
  };
};

export default requirePermission;
