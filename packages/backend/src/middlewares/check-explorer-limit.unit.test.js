import { jest } from '@jest/globals';

const { default: checkExplorerLimit } = await import('./check-explorer-limit.js');

const makeReq = (overrides = {}) => ({
  auth: undefined,
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

describe('checkExplorerLimit', () => {
  test('passes through when role is not explorer', () => {
    const req = makeReq({ auth: { role: 'member', userId: 'u1' } });
    const next = jest.fn();
    checkExplorerLimit('analysis', 3)(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('passes through when auth is undefined', () => {
    const req = makeReq();
    const next = jest.fn();
    checkExplorerLimit('analysis', 3)(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('allows explorer under limit', () => {
    const req = makeReq({ auth: { role: 'explorer', userId: 'u1' } });
    const next = jest.fn();
    const middleware = checkExplorerLimit('analysis', 3);
    middleware(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('blocks explorer when limit reached', () => {
    const req = makeReq({ auth: { role: 'explorer', userId: 'u1' } });
    const next = jest.fn();
    const middleware = checkExplorerLimit('analysis', 3);

    // Call 3 times successfully
    middleware(req, makeRes(), jest.fn());
    middleware(req, makeRes(), jest.fn());
    middleware(req, makeRes(), jest.fn());
    // 4th call should fail
    middleware(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  test('different actions have independent counters', () => {
    const req = makeReq({ auth: { role: 'explorer', userId: 'u2' } });
    const nextAnalysis = jest.fn();
    const nextPdf = jest.fn();
    const analysisMw = checkExplorerLimit('analysis', 1);
    const pdfMw = checkExplorerLimit('pdf', 1);

    analysisMw(req, makeRes(), jest.fn());
    analysisMw(req, makeRes(), nextAnalysis); // should fail (analysis limit=1)
    expect(nextAnalysis).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));

    pdfMw(req, makeRes(), nextPdf); // pdf counter still =0 → pass
    expect(nextPdf).toHaveBeenCalledWith();
  });
});
