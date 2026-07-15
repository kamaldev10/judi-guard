import { ForbiddenError } from '#shared/utils/errors.js';

/**
 * Middleware requireSuperuser:
 * Memastikan user yang terautentikasi memiliki role 'superuser'.
 * Gunakan untuk endpoint manajemen workspace yang hanya boleh diakses superuser.
 */
const requireSuperuser = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'superuser') {
    return next(
      new ForbiddenError('Akses ditolak. Hanya superuser yang dapat melakukan aksi ini.'),
    );
  }
  next();
};

export default requireSuperuser;
