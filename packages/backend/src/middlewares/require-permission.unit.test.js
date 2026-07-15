import { jest } from '@jest/globals';

const { default: requirePermission } = await import('./require-permission.js');

// hasPermission is not exported, we test it indirectly through requirePermission

const makeReq = (overrides = {}) => ({
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

/* ───────── requirePermission: no context ───────── */
describe('requirePermission — no context / fallback', () => {
  test('403 when no req.membership and no req.auth', async () => {
    const req = makeReq();
    const next = jest.fn();
    requirePermission('profile:read')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('falls back to req.auth when req.membership is null (explorer)', async () => {
    const req = makeReq({
      auth: { role: 'explorer', userId: 'u1', email: 'e@x.com' },
      membership: null,
    });
    const next = jest.fn();
    requirePermission('profile:read')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });
});

/* ───────── hasPermission via requirePermission: deny/grant overrides ───────── */
describe('requirePermission — deny override', () => {
  test('403 when membership has deny override for the permission', async () => {
    const req = makeReq({
      membership: {
        role: 'owner',
        permissionOverrides: { deny: ['profile:read'], grant: [] },
      },
    });
    const next = jest.fn();
    requirePermission('profile:read')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

describe('requirePermission — grant override', () => {
  test('200 when grant override gives a permission not in default role', async () => {
    const req = makeReq({
      membership: {
        role: 'member',
        permissionOverrides: { deny: [], grant: ['workspace:invite'] },
      },
    });
    const next = jest.fn();
    requirePermission('workspace:invite')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });
});

/* ───────── hasPermission: default role permissions ───────── */
describe('requirePermission — default role permissions', () => {
  test('200 — owner has config:write', async () => {
    const req = makeReq({
      membership: { role: 'owner', permissionOverrides: { deny: [], grant: [] } },
    });
    const next = jest.fn();
    requirePermission('config:write')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('403 — member does not have workspace:invite', async () => {
    const req = makeReq({
      membership: { role: 'member', permissionOverrides: { deny: [], grant: [] } },
    });
    const next = jest.fn();
    requirePermission('workspace:invite')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('403 — member does not have workspace:read', async () => {
    const req = makeReq({
      membership: { role: 'member', permissionOverrides: { deny: [], grant: [] } },
    });
    const next = jest.fn();
    requirePermission('workspace:read')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

/* ───────── Multiple permissions ───────── */
describe('requirePermission — multiple permissions', () => {
  test('200 when owner has all requested permissions', async () => {
    const req = makeReq({
      membership: { role: 'owner', permissionOverrides: { deny: [], grant: [] } },
    });
    const next = jest.fn();
    requirePermission('profile:read', 'config:write')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('403 when missing one of multiple requested permissions', async () => {
    const req = makeReq({
      membership: { role: 'member', permissionOverrides: { deny: [], grant: [] } },
    });
    const next = jest.fn();
    requirePermission('profile:read', 'workspace:invite')(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});
