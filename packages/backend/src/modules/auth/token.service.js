import crypto from 'crypto';
import { generateToken } from '#shared/utils/jwt.js';
import RefreshToken from './refresh-token.model.js';
import TokenBlacklist from './token-blacklist.model.js';

const generateJti = () => crypto.randomUUID();

export const generateTokenPair = async (userPayload) => {
  const jti = generateJti();
  const accessToken = generateToken({ ...userPayload, jti });
  const family = generateJti();
  const refreshTokenRaw = crypto.randomBytes(48).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
  await RefreshToken.create({
    userId: userPayload.userId,
    tokenHash: refreshTokenHash,
    family,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { accessToken, refreshToken: refreshTokenRaw, jti };
};

export const refreshAccessToken = async (refreshTokenRaw) => {
  const hash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
  const stored = await RefreshToken.findOne({ tokenHash: hash });
  if (!stored) throw new Error('REFRESH_INVALID');
  if (stored.expiresAt < new Date()) {
    await stored.deleteOne();
    throw new Error('REFRESH_EXPIRED');
  }
  // Rotate: delete old, create new (same family)
  await stored.deleteOne();
  const jti = generateJti();
  const accessToken = generateToken({ userId: stored.userId.toString(), jti });
  const newRefreshRaw = crypto.randomBytes(48).toString('hex');
  const newHash = crypto.createHash('sha256').update(newRefreshRaw).digest('hex');
  await RefreshToken.create({
    userId: stored.userId,
    tokenHash: newHash,
    family: stored.family,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { accessToken, refreshToken: newRefreshRaw };
};

export const revokeUserTokens = async (userId) => {
  await RefreshToken.deleteMany({ userId });
};

export const revokeRefreshToken = async (refreshTokenRaw) => {
  const hash = crypto.createHash('sha256').update(refreshTokenRaw).digest('hex');
  await RefreshToken.deleteOne({ tokenHash: hash });
};

export const isTokenBlacklisted = async (jti) => {
  if (!jti) return false;
  const entry = await TokenBlacklist.findOne({ jti });
  return !!entry;
};

export const blacklistAccessToken = async (decoded) => {
  if (!decoded.jti) return;
  await TokenBlacklist.create({
    jti: decoded.jti,
    userId: decoded.userId,
    expiresAt: new Date(decoded.exp * 1000),
  });
};
