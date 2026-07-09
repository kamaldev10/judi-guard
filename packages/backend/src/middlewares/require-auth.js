import { verifyToken } from '#shared/utils/jwt.js';
import { UnauthorizedError } from '#shared/utils/errors.js';
import { UserRepository } from '#modules/user/user.repository.js';

/**
 * Middleware requireAuth:
 * 1. Memeriksa token JWT pada header Authorization (Bearer <token>).
 * 2. Memverifikasi validitas token JWT.
 * 3. Memastikan user yang terkait masih ada di database.
 * 4. Memasang req.auth = { userId, email, role, workspaceId: null }
 * 5. Memasang req.user (legacy support) tanpa menyertakan password dan token sensitif.
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

    const decodedPayload = verifyToken(token);
    if (!decodedPayload || !decodedPayload.userId) {
      return next(new UnauthorizedError('Anda tidak login'));
    }

    const currentUser = await UserRepository.findById(decodedPayload.userId);
    if (!currentUser) {
      return next(new UnauthorizedError('Anda tidak login'));
    }

    // Set req.auth sesuai spesifikasi Fase 1
    req.auth = {
      userId: currentUser._id.toString(),
      email: currentUser.email,
      role: currentUser.role || 'member',
      workspaceId: null, // Fase 2
    };

    // Set req.user (legacy support untuk downstream controllers)
    req.user = currentUser.toObject();
    delete req.user.password;
    delete req.user.youtubeAccessToken;
    delete req.user.youtubeRefreshToken;
    delete req.user.youtubeTokenExpiresAt;
    delete req.user.__v;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Anda tidak login'));
    }
    next(error);
  }
};

export default requireAuth;
