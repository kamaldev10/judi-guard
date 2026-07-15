import { jest } from '@jest/globals';

const { default: requireSuperuser } = await import('./require-superuser.js');

const makeReq = (overrides = {}) => ({ auth: undefined, ...overrides });
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('requireSuperuser', () => {
  test('403 when req.auth.role is not superuser', async () => {
    const req = makeReq({ auth: { role: 'explorer', userId: 'u1' } });
    const next = jest.fn();
    requireSuperuser(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Akses ditolak. Hanya superuser yang dapat melakukan aksi ini.',
      }),
    );
  });

  test('calls next() when role is superuser', async () => {
    const req = makeReq({ auth: { role: 'superuser', userId: 'u1' } });
    const next = jest.fn();
    requireSuperuser(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('403 when req.auth is undefined', async () => {
    const req = makeReq();
    const next = jest.fn();
    requireSuperuser(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});
