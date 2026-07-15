import { jest } from '@jest/globals';

// ── Mocks ──
const mockVerifyToken = jest.fn();
const mockIsTokenBlacklisted = jest.fn();
const mockFindById = jest.fn();
const mockWorkspaceMemberFindOne = jest.fn();

jest.unstable_mockModule('#shared/utils/jwt.js', () => ({ verifyToken: mockVerifyToken }));
jest.unstable_mockModule('#modules/auth/token.service.js', () => ({
  isTokenBlacklisted: mockIsTokenBlacklisted,
}));
jest.unstable_mockModule('#modules/user/user.model.js', () => ({
  default: { findById: mockFindById },
}));
jest.unstable_mockModule('#modules/workspace/workspace.model.js', () => ({
  WorkspaceMember: { findOne: mockWorkspaceMemberFindOne },
}));

const requireAuth = (await import('./require-auth.js')).default;

const makeReq = (overrides = {}) => ({
  headers: {},
  auth: undefined,
  membership: undefined,
  ...overrides,
});
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

/* ───────── No token ───────── */
describe('requireAuth — no token', () => {
  test('returns 401 when no Authorization header', async () => {
    const req = makeReq();
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
    expect(next.mock.calls[0][0].message).toBe('Anda tidak login');
  });

  test('returns 401 when Authorization header is malformed', async () => {
    const req = makeReq({ headers: { authorization: 'Basic xxx' } });
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

/* ───────── Token verification ───────── */
describe('requireAuth — token verification', () => {
  const req = makeReq({ headers: { authorization: 'Bearer some.jwt.here' } });

  test('401 when token expired', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('TOKEN_EXPIRED');
    });
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Sesi Anda sudah habis. Silakan login ulang.',
      }),
    );
  });

  test('401 when token invalid', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('TOKEN_INVALID');
    });
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Token tidak valid. Silakan login ulang.',
      }),
    );
  });

  test('401 when decoded payload has no userId', async () => {
    mockVerifyToken.mockReturnValue({ jti: 'abc' });
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  test('401 when token is blacklisted', async () => {
    mockVerifyToken.mockReturnValue({ userId: 'u1', jti: 'abc' });
    mockIsTokenBlacklisted.mockResolvedValue(true);
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Token sudah tidak valid. Silakan login ulang.',
      }),
    );
  });
});

/* ───────── User lookup ───────── */
describe('requireAuth — user lookup', () => {
  const req = makeReq({ headers: { authorization: 'Bearer valid.jwt' } });

  test('401 when user not found in DB', async () => {
    mockVerifyToken.mockReturnValue({ userId: 'u1', jti: 'abc' });
    mockIsTokenBlacklisted.mockResolvedValue(false);
    mockFindById.mockResolvedValue(null);
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});

/* ───────── Explorer (no workspace) ───────── */
describe('requireAuth — explorer role', () => {
  const explorerUser = {
    _id: { toString: () => 'u1' },
    email: 'e@x.com',
    role: 'explorer',
    workspaceId: null,
    isVerified: true,
    fullName: '',
    username: 'explorer',
    youtubeChannelId: null,
    youtubeChannelName: null,
  };
  const req = makeReq({ headers: { authorization: 'Bearer valid.jwt' } });

  test('sets req.auth, req.membership=null, calls next()', async () => {
    mockVerifyToken.mockReturnValue({ userId: 'u1', jti: 'abc' });
    mockIsTokenBlacklisted.mockResolvedValue(false);
    mockFindById.mockResolvedValue(explorerUser);
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(req.auth).toBeDefined();
    expect(req.auth.role).toBe('explorer');
    expect(req.membership).toBeNull();
    expect(next).toHaveBeenCalledWith();
  });
});

/* ───────── Workspace membership ───────── */
describe('requireAuth — workspace membership', () => {
  const workspaceUser = {
    _id: { toString: () => 'u2' },
    email: 'w@x.com',
    role: 'member',
    workspaceId: { toString: () => 'ws1' },
    isVerified: true,
    fullName: '',
    username: 'wuser',
    youtubeChannelId: null,
    youtubeChannelName: null,
  };
  const membershipDoc = {
    workspaceId: { toString: () => 'ws1' },
    role: 'admin',
    permissionOverrides: { grant: [], deny: [] },
    toObject: jest.fn().mockReturnValue({
      workspaceId: 'ws1',
      role: 'admin',
      permissionOverrides: { grant: [], deny: [] },
    }),
  };
  const req = makeReq({ headers: { authorization: 'Bearer valid.jwt' } });

  test('sets req.auth + req.membership when membership found', async () => {
    mockVerifyToken.mockReturnValue({ userId: 'u2', jti: 'abc' });
    mockIsTokenBlacklisted.mockResolvedValue(false);
    mockFindById.mockResolvedValue(workspaceUser);
    mockWorkspaceMemberFindOne.mockResolvedValue(membershipDoc);
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(req.auth).toBeDefined();
    expect(req.auth.role).toBe('admin');
    expect(req.membership).toBeDefined();
    expect(next).toHaveBeenCalledWith();
  });

  test('403 when membership not found', async () => {
    mockVerifyToken.mockReturnValue({ userId: 'u2', jti: 'abc' });
    mockIsTokenBlacklisted.mockResolvedValue(false);
    mockFindById.mockResolvedValue(workspaceUser);
    mockWorkspaceMemberFindOne.mockResolvedValue(null);
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

/* ───────── Catch-all error handling ───────── */
describe('requireAuth — error catch', () => {
  test('catches JsonWebTokenError from outside try block', async () => {
    const req = makeReq({ headers: { authorization: 'Bearer x' } });
    mockVerifyToken.mockReturnValue({ userId: 'u1', jti: 'abc' });
    mockIsTokenBlacklisted.mockResolvedValue(false);
    mockFindById.mockRejectedValue(Object.assign(new Error('bad'), { name: 'JsonWebTokenError' }));
    const next = jest.fn();
    await requireAuth(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });
});
