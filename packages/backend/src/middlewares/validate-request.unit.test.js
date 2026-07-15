import { jest } from '@jest/globals';

// Mock Joi schema
const mockValidate = jest.fn();

jest.unstable_mockModule('#shared/utils/errors.js', () => ({
  BadRequestError: class BadRequestError extends Error {
    constructor(m) {
      super(m);
      this.statusCode = 400;
      this.status = 'fail';
      this.isOperational = true;
    }
  },
}));

const { default: validateRequest } = await import('./validate-request.js');

const makeReq = (overrides = {}) => ({ body: {}, query: {}, ...overrides });
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const schema = { validate: mockValidate };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('validateRequest', () => {
  test('calls next() when validation passes, replaces req.body', () => {
    const req = makeReq({ body: { name: 'test' } });
    const next = jest.fn();
    mockValidate.mockReturnValue({ error: null, value: { name: 'test', _stripped: undefined } });

    validateRequest(schema)(req, makeRes(), next);

    expect(mockValidate).toHaveBeenCalledWith(
      { name: 'test' },
      { abortEarly: false, stripUnknown: true },
    );
    expect(req.body).toEqual({ name: 'test', _stripped: undefined });
    expect(next).toHaveBeenCalledWith();
  });

  test('calls next(BadRequestError) when validation fails', () => {
    const req = makeReq({ body: { name: '' } });
    const next = jest.fn();
    mockValidate.mockReturnValue({
      error: { details: [{ message: '"name" is not allowed to be empty' }] },
      value: {},
    });

    validateRequest(schema)(req, makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: '"name" is not allowed to be empty' }),
    );
  });

  test('validates custom property (query) when specified', () => {
    const req = makeReq({ query: { page: '1' } });
    const next = jest.fn();
    mockValidate.mockReturnValue({ error: null, value: { page: '1' } });

    validateRequest(schema, 'query')(req, makeRes(), next);

    expect(mockValidate).toHaveBeenCalledWith(
      { page: '1' },
      { abortEarly: false, stripUnknown: true },
    );
    expect(next).toHaveBeenCalledWith();
  });
});
