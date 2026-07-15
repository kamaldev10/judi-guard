import { jest } from '@jest/globals';

// We need to test error-handler which imports from #shared/utils/errors.js.
// The error classes themselves are used to construct test errors — they're real.
// The handler itself doesn't need mocking, it just checks error properties.

const { default: errorHandler } = await import('./error-handler.js');

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const makeReq = () => ({});
const makeNext = () => jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('errorHandler', () => {
  /* ─── Operational errors ─── */
  test('dev mode returns stack trace', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const err = Object.assign(new Error('test'), {
      statusCode: 400,
      status: 'fail',
      isOperational: true,
    });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ stack: expect.any(String) }));
    process.env.NODE_ENV = OLD;
  });

  test('prod mode returns no stack for operational error', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('test-err'), {
      statusCode: 401,
      status: 'fail',
      isOperational: true,
    });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 'fail', message: 'test-err' });
    process.env.NODE_ENV = OLD;
  });

  test('prod mode returns generic 500 for non-operational error', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = new Error('secret internals');
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went wrong on our side.',
    });
    process.env.NODE_ENV = OLD;
  });

  /* ─── Adapter: CastError ─── */
  test('adapts CastError to 400 BadRequest', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('bad cast'), {
      name: 'CastError',
      path: '_id',
      value: 'abc',
    });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail' }));
    process.env.NODE_ENV = OLD;
  });

  /* ─── Adapter: ValidationError ─── */
  test('adapts Mongoose ValidationError to 400', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('validation fail'), {
      name: 'ValidationError',
      errors: { email: { message: 'Email is required' } },
    });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(400);
    process.env.NODE_ENV = OLD;
  });

  /* ─── Adapter: Duplicate key ─── */
  test('adapts duplicate key (11000) to 409', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('dup'), { code: 11000, keyValue: { email: 'a@b.com' } });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(409);
    process.env.NODE_ENV = OLD;
  });

  /* ─── Adapter: Axios error ─── */
  test('adapts Axios error to 502 by default', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('API fail'), {
      isAxiosError: true,
      response: { status: 502, data: { error: { message: 'Upstream down' } } },
    });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(502);
    process.env.NODE_ENV = OLD;
  });

  /* ─── Adapter: JWT errors ─── */
  test('adapts JsonWebTokenError to 401', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('jwt malformed'), { name: 'JsonWebTokenError' });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(401);
    process.env.NODE_ENV = OLD;
  });

  test('adapts TokenExpiredError to 401', () => {
    const OLD = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const err = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' });
    const res = makeRes();
    errorHandler(err, makeReq(), res, makeNext());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token kedaluwarsa. Silakan login kembali.' }),
    );
    process.env.NODE_ENV = OLD;
  });
});
