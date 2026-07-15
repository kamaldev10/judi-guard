import { jest } from '@jest/globals';
import crypto from 'crypto';

const mockGenerateToken = jest.fn();
const mockRefreshCreate = jest.fn();
const mockRefreshFindOne = jest.fn();
const mockRefreshDeleteMany = jest.fn();
const mockRefreshDeleteOne = jest.fn();
const mockBlacklistFindOne = jest.fn();
const mockBlacklistCreate = jest.fn();

jest.unstable_mockModule('#shared/utils/jwt.js', () => ({ generateToken: mockGenerateToken }));
jest.unstable_mockModule('./refresh-token.model.js', () => ({
  default: {
    create: mockRefreshCreate,
    findOne: mockRefreshFindOne,
    deleteMany: mockRefreshDeleteMany,
    deleteOne: mockRefreshDeleteOne,
  },
}));
jest.unstable_mockModule('./token-blacklist.model.js', () => ({
  default: { findOne: mockBlacklistFindOne, create: mockBlacklistCreate },
}));

const {
  generateTokenPair,
  refreshAccessToken,
  revokeUserTokens,
  revokeRefreshToken,
  isTokenBlacklisted,
  blacklistAccessToken,
} = await import('./token.service.js');

beforeEach(() => {
  jest.clearAllMocks();
});

/* ---------- generateTokenPair ---------- */
describe('generateTokenPair', () => {
  const userPayload = {
    userId: '507f1f77bcf86cd799439011',
    email: 'a@b.com',
    role: 'explorer',
    workspaceId: null,
  };

  test('generates access token + refresh token, saves refresh to DB', async () => {
    mockGenerateToken.mockReturnValue('access.jwt.xxx');
    mockRefreshCreate.mockResolvedValue({});

    const result = await generateTokenPair(userPayload);

    expect(mockGenerateToken).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: userPayload.userId,
        email: userPayload.email,
        role: 'explorer',
        jti: expect.any(String),
      }),
    );
    expect(mockRefreshCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: userPayload.userId,
        tokenHash: expect.any(String),
        family: expect.any(String),
      }),
    );
    expect(result).toMatchObject({
      accessToken: 'access.jwt.xxx',
      refreshToken: expect.any(String),
    });
    expect(result).toHaveProperty('jti');
  });
});

/* ---------- refreshAccessToken ---------- */
describe('refreshAccessToken', () => {
  const refreshRaw = crypto.randomBytes(48).toString('hex');
  const hash = crypto.createHash('sha256').update(refreshRaw).digest('hex');
  const storedDoc = {
    tokenHash: hash,
    userId: { toString: () => '507f1f77bcf86cd799439011' },
    family: 'fam-123',
    expiresAt: new Date(Date.now() + 86400000),
    deleteOne: jest.fn().mockResolvedValue(),
  };

  test('returns new token pair when refresh token is valid', async () => {
    mockRefreshFindOne.mockResolvedValue(storedDoc);
    mockGenerateToken.mockReturnValue('new.access.jwt');
    mockRefreshCreate.mockResolvedValue({});

    const result = await refreshAccessToken(refreshRaw);

    expect(storedDoc.deleteOne).toHaveBeenCalled();
    expect(mockRefreshCreate).toHaveBeenCalledWith(expect.objectContaining({ family: 'fam-123' }));
    expect(result).toMatchObject({
      accessToken: 'new.access.jwt',
      refreshToken: expect.any(String),
    });
  });

  test('throws REFRESH_INVALID when token not found', async () => {
    mockRefreshFindOne.mockResolvedValue(null);
    await expect(refreshAccessToken(refreshRaw)).rejects.toThrow('REFRESH_INVALID');
  });

  test('throws REFRESH_EXPIRED when token is expired', async () => {
    const expiredDoc = {
      ...storedDoc,
      expiresAt: new Date(Date.now() - 1000),
      deleteOne: jest.fn().mockResolvedValue(),
    };
    mockRefreshFindOne.mockResolvedValue(expiredDoc);

    await expect(refreshAccessToken(refreshRaw)).rejects.toThrow('REFRESH_EXPIRED');
    expect(expiredDoc.deleteOne).toHaveBeenCalled();
  });
});

/* ---------- revokeUserTokens ---------- */
describe('revokeUserTokens', () => {
  test('deletes all refresh tokens for userId', async () => {
    mockRefreshDeleteMany.mockResolvedValue({ deletedCount: 3 });
    await revokeUserTokens('u123');
    expect(mockRefreshDeleteMany).toHaveBeenCalledWith({ userId: 'u123' });
  });
});

/* ---------- revokeRefreshToken ---------- */
describe('revokeRefreshToken', () => {
  test('deletes one refresh token by hash', async () => {
    const raw = 'some-raw-token';
    mockRefreshDeleteOne.mockResolvedValue({ deletedCount: 1 });
    await revokeRefreshToken(raw);
    expect(mockRefreshDeleteOne).toHaveBeenCalledWith({
      tokenHash: crypto.createHash('sha256').update(raw).digest('hex'),
    });
  });
});

/* ---------- isTokenBlacklisted ---------- */
describe('isTokenBlacklisted', () => {
  test('returns true when jti is blacklisted', async () => {
    mockBlacklistFindOne.mockResolvedValue({ jti: 'abc' });
    expect(await isTokenBlacklisted('abc')).toBe(true);
  });

  test('returns false when jti is not blacklisted', async () => {
    mockBlacklistFindOne.mockResolvedValue(null);
    expect(await isTokenBlacklisted('abc')).toBe(false);
  });

  test('returns false when jti is falsy', async () => {
    expect(await isTokenBlacklisted(null)).toBe(false);
    expect(await isTokenBlacklisted(undefined)).toBe(false);
    expect(await isTokenBlacklisted('')).toBe(false);
  });
});

/* ---------- blacklistAccessToken ---------- */
describe('blacklistAccessToken', () => {
  test('saves jti to blacklist with correct expiry', async () => {
    mockBlacklistCreate.mockResolvedValue({});
    const decoded = { jti: 'abc123', userId: 'u1', exp: 2000000000 };
    await blacklistAccessToken(decoded);
    expect(mockBlacklistCreate).toHaveBeenCalledWith({
      jti: 'abc123',
      userId: 'u1',
      expiresAt: new Date(2000000000 * 1000),
    });
  });

  test('does nothing when decoded has no jti', async () => {
    await blacklistAccessToken({ userId: 'u1' });
    expect(mockBlacklistCreate).not.toHaveBeenCalled();
  });
});
