import { jest } from '@jest/globals';

// ── Mutable mocks ──
const mockVerifyIdToken = jest.fn();
const mockOAuthInstance = { verifyIdToken: (...a) => mockVerifyIdToken(...a) };
const mockConfig = { googleSignIn: { clientId: 'test-client-id' } };

const mockUserRepo = {
  findByEmailWithPassword: jest.fn(),
  findByGoogleIdOrEmail: jest.fn(),
};
const mockTokenService = { generateTokenPair: jest.fn() };

jest.unstable_mockModule('#modules/user/user.repository.js', () => ({
  UserRepository: mockUserRepo,
}));
jest.unstable_mockModule('#config/environment.js', () => ({ default: mockConfig }));
jest.unstable_mockModule('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => mockOAuthInstance),
}));
jest.unstable_mockModule('#modules/auth/token.service.js', () => mockTokenService);

const { loginUser, signInWithGoogle } = await import('./auth.service.js');

const makeUser = (overrides = {}) => ({
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed123',
  role: 'explorer',
  workspaceId: null,
  isVerified: true,
  googleId: null,
  fullName: '',
  profilePictureUrl: '',
  comparePassword: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({ email: 'test@example.com' }),
  save: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockConfig.googleSignIn = { clientId: 'test-client-id' };
});

/* ───────── loginUser ───────── */
describe('loginUser', () => {
  const creds = { email: 'test@example.com', password: 'secret123' };

  test('throws UnauthorizedError when user not found', async () => {
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(null);
    await expect(loginUser(creds)).rejects.toThrow('Akun belum terdaftar.');
  });

  test('throws UnauthorizedError when password does not match', async () => {
    const user = makeUser();
    user.comparePassword.mockResolvedValue(false);
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(user);
    await expect(loginUser(creds)).rejects.toThrow('Password anda salah.');
  });

  test('returns { accessToken, refreshToken, user } on success', async () => {
    mockUserRepo.findByEmailWithPassword.mockResolvedValue(makeUser());
    mockTokenService.generateTokenPair.mockResolvedValue({
      accessToken: 'acc.jwt',
      refreshToken: 'ref.tok',
    });

    const result = await loginUser(creds);

    expect(result).toMatchObject({
      accessToken: 'acc.jwt',
      refreshToken: 'ref.tok',
      user: expect.any(Object),
    });
  });
});

/* ───────── signInWithGoogle ───────── */
describe('signInWithGoogle', () => {
  const googlePayload = {
    sub: 'g123',
    email: 'g@example.com',
    name: 'G User',
    email_verified: true,
    picture: 'pic.jpg',
  };

  beforeEach(() => {
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => ({ ...googlePayload }) });
  });

  test('throws AppError when config.googleSignIn is missing', async () => {
    mockConfig.googleSignIn = null;
    await expect(signInWithGoogle('token')).rejects.toThrow('Konfigurasi Google Sign-In Client ID');
  });

  test('throws UnauthorizedError when Google token verification fails', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('Invalid token signature'));
    await expect(signInWithGoogle('bad-token')).rejects.toThrow('Sesi Google tidak valid');
  });

  test('throws UnauthorizedError when google payload has no email', async () => {
    mockVerifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'g123' }) });
    await expect(signInWithGoogle('no-email')).rejects.toThrow('Google ID Token tidak valid');
  });

  test('returns register_required for new email', async () => {
    mockUserRepo.findByGoogleIdOrEmail.mockResolvedValue(null);
    const result = await signInWithGoogle('new-token');
    expect(result).toMatchObject({ status: 'register_required', email: 'g@example.com' });
  });

  test('returns { accessToken, refreshToken, user, isNewUser:false } for existing user', async () => {
    const user = makeUser({ googleId: 'g123' });
    mockUserRepo.findByGoogleIdOrEmail.mockResolvedValue(user);
    mockTokenService.generateTokenPair.mockResolvedValue({
      accessToken: 'acc.jwt',
      refreshToken: 'ref.tok',
    });

    const result = await signInWithGoogle('existing-token');

    expect(result).toMatchObject({
      accessToken: 'acc.jwt',
      refreshToken: 'ref.tok',
      isNewUser: false,
    });
  });
});
