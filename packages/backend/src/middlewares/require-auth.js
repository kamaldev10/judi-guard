import { verifyToken } from '#shared/utils/jwt.js';
import { isTokenBlacklisted } from '#modules/auth/token.service.js';
import { UnauthorizedError, ForbiddenError } from '#shared/utils/errors.js';
import User from '#modules/user/user.model.js';
import { WorkspaceMember } from '#modules/workspace/workspace.model.js';

/**
 * Middleware requireAuth:
 * 1. Memeriksa token JWT pada header Authorization (Bearer <token>).
 * 2. Memverifikasi validitas token JWT.
 * 3. Memastikan user yang terkait masih ada di database.
 * 4. Mendeteksi active workspace (dari header 'x-workspace-id' atau token payload atau user default).
 * 5. Melakukan inisialisasi otomatis jika user belum memiliki workspace.
 * 6. Memastikan user adalah anggota dari active workspace.
 * 7. Memasang req.auth = { userId, email, role, workspaceId }
 * 8. Memasang req.membership (data membership aktif). req.auth mencakup semua field yang controllers butuhkan.
 */
const requireAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Anda tidak login'));
    }

    let decodedPayload;
    try {
      decodedPayload = verifyToken(token);
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        return next(new UnauthorizedError('Sesi Anda sudah habis. Silakan login ulang.'));
      }
      return next(new UnauthorizedError('Token tidak valid. Silakan login ulang.'));
    }

    if (!decodedPayload || !decodedPayload.userId) {
      return next(new UnauthorizedError('Anda tidak login'));
    }

    if (await isTokenBlacklisted(decodedPayload.jti)) {
      return next(new UnauthorizedError('Token sudah tidak valid. Silakan login ulang.'));
    }

    const currentUser = await User.findById(decodedPayload.userId);
    if (!currentUser) {
      return next(new UnauthorizedError('Anda tidak login'));
    }

    // Set req.auth dengan semua field yang controllers butuhkan
    req.auth = {
      userId: currentUser._id.toString(),
      email: currentUser.email,
      role: currentUser.role,
      workspaceId: currentUser.workspaceId ? currentUser.workspaceId.toString() : null,
      isVerified: currentUser.isVerified,
      fullName: currentUser.fullName,
      username: currentUser.username,
      youtubeChannelId: currentUser.youtubeChannelId,
      youtubeChannelName: currentUser.youtubeChannelName,
    };

    // Jika explorer (tidak punya workspace), lewati membership check
    if (currentUser.role === 'explorer' || !currentUser.workspaceId) {
      req.membership = null;
      return next();
    }

    // Untuk user dengan workspace — ambil membership aktif
    let workspaceId = req.headers['x-workspace-id'] || decodedPayload.workspaceId;
    if (!workspaceId && currentUser.workspaceId) {
      workspaceId = currentUser.workspaceId.toString();
    }

    const membership = await WorkspaceMember.findOne({
      userId: currentUser._id,
      workspaceId,
    });

    if (!membership) {
      return next(new ForbiddenError('Anda bukan anggota dari workspace ini.'));
    }

    // Overwrite workspaceId dari membership yang valid
    req.auth.workspaceId = membership.workspaceId.toString();
    req.auth.role = membership.role;

    // Simpan objek membership untuk pengecekan permission granular
    req.membership = membership.toObject();

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Anda tidak login'));
    }
    next(error);
  }
};

export default requireAuth;
