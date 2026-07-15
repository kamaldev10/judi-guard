import { jest } from '@jest/globals';

// ── Factory for fresh mocks per-test ──
const createMockUserRepo = () => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithOtp: jest.fn(),
  findByEmailWithPassword: jest.fn(),
});

const mockSendEmail = jest.fn();
const mockEmailTemplates = {
  otpVerification: jest.fn(({ username: _username, otp }) => ({
    subject: 'Verifikasi OTP',
    text: `Kode OTP: ${otp}`,
    html: '',
  })),
  otpVerificationGoogle: jest.fn(({ username: _username, otp }) => ({
    subject: 'Verifikasi OTP (Google)',
    text: `Kode OTP: ${otp}`,
    html: '',
  })),
  otpResend: jest.fn(({ username: _username, otp }) => ({
    subject: 'Kirim Ulang OTP',
    text: `Kode OTP baru: ${otp}`,
    html: '',
  })),
};
const mockGenerateToken = jest.fn();
const mockGenerateTokenPair = jest.fn();

// ── Import order matters: set up mocks BEFORE dynamic import ──
jest.unstable_mockModule('#modules/user/user.repository.js', () => ({
  UserRepository: createMockUserRepo(),
}));
jest.unstable_mockModule('#shared/utils/email-sender.js', () => ({ default: mockSendEmail }));
jest.unstable_mockModule('#shared/email-templates/index.js', () => mockEmailTemplates);
jest.unstable_mockModule('#modules/auth/token.service.js', () => ({
  generateTokenPair: mockGenerateTokenPair,
}));
jest.unstable_mockModule('#shared/utils/jwt.js', () => ({ generateToken: mockGenerateToken }));

// Import module AFTER mocks are set up
const { registerUser, createGoogleUser, verifyOtp, resendOtp, setPasswordAfterOtp } =
  await import('./otp.service.js');

const makeUser = (overrides = {}) => ({
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed123',
  role: 'explorer',
  workspaceId: null,
  isVerified: false,
  googleId: null,
  fullName: '',
  profilePictureUrl: '',
  otpCode: '123456',
  otpExpiresAt: new Date(Date.now() + 600000),
  comparePassword: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({ email: 'test@example.com' }),
  save: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

/* ───────── registerUser ───────── */
describe('registerUser', () => {
  const userData = { username: 'newuser', email: 'new@example.com', password: 'password123' };

  test('throws BadRequestError if email already verified', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmail.mockResolvedValue({ ...makeUser(), isVerified: true });
    await expect(registerUser(userData)).rejects.toThrow('Email sudah terdaftar');
  });

  test('creates new user with OTP', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.findByUsername.mockResolvedValue(null);
    mockSendEmail.mockResolvedValue({ success: true });
    mockRepo.create.mockResolvedValue(makeUser());

    const result = await registerUser(userData);

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'newuser', email: 'new@example.com', isVerified: false }),
    );
    expect(result.message).toBe('Registrasi berhasil. Kode OTP telah dikirim ke test@example.com.');
  });
});

/* ───────── createGoogleUser ───────── */
describe('createGoogleUser', () => {
  test('generates unique username', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByUsername.mockImplementation((name) => {
      if (name === 'guser') return { _id: 'u1' };
      if (name === 'guser1') return { _id: 'u2' };
      return null;
    });
    mockRepo.create.mockResolvedValue(makeUser({ username: 'guser2' }));
    mockSendEmail.mockResolvedValue({ success: true });

    await createGoogleUser('g@example.com', 'G User', 'pic.jpg');

    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ username: 'guser2' }));
  });

  test('returns status otp_required', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByUsername.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue(makeUser());
    mockSendEmail.mockResolvedValue({ success: true });

    const result = await createGoogleUser('g@example.com', 'G User', 'pic.jpg');

    expect(result).toMatchObject({ status: 'otp_required', email: expect.any(String) });
  });
});

/* ───────── resendOtp ───────── */
describe('resendOtp', () => {
  test('throws BadRequestError if email missing', async () => {
    await expect(resendOtp(null)).rejects.toThrow('Email diperlukan');
  });

  test('throws NotFoundError if user not found', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmail.mockResolvedValue(null);
    await expect(resendOtp('a@b.com')).rejects.toThrow('tidak ditemukan');
  });

  test('throws BadRequestError if already verified', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmail.mockResolvedValue({ ...makeUser(), isVerified: true });
    await expect(resendOtp('a@b.com')).rejects.toThrow('sudah diverifikasi');
  });

  test('generates new OTP, sends email, returns message', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmail.mockResolvedValue(makeUser());
    mockSendEmail.mockResolvedValue({ success: true });

    const result = await resendOtp('a@b.com');

    expect(result.message).toBe('Kode OTP baru telah dikirim ke test@example.com.');
  });
});

/* ───────── setPasswordAfterOtp ───────── */
describe('setPasswordAfterOtp', () => {
  test('throws BadRequestError if email or password missing', async () => {
    await expect(setPasswordAfterOtp(null, 'pass123')).rejects.toThrow('Email dan password');
  });

  test('throws NotFoundError if user not found', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmailWithPassword.mockResolvedValue(null);
    await expect(setPasswordAfterOtp('a@b.com', 'pass123')).rejects.toThrow('tidak ditemukan');
  });

  test('throws BadRequestError if user already has password', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    mockRepo.findByEmailWithPassword.mockResolvedValue({ ...makeUser(), password: 'hashed' });
    await expect(setPasswordAfterOtp('a@b.com', 'pass123')).rejects.toThrow(
      'sudah memiliki password',
    );
  });

  test('sets password, returns tokenPair', async () => {
    const mockRepo = (await import('#modules/user/user.repository.js')).UserRepository;
    const user = makeUser({ password: null });
    mockRepo.findByEmailWithPassword.mockResolvedValue(user);
    mockGenerateTokenPair.mockResolvedValue({ accessToken: 'acc', refreshToken: 'ref' });

    const result = await setPasswordAfterOtp('a@b.com', 'newPass123');

    expect(user.password).toBe('newPass123');
    expect(result).toMatchObject({ status: 'success', accessToken: 'acc', refreshToken: 'ref' });
  });
});

/* ───────── verifyOtp ───────── */
describe('verifyOtp', () => {
  test('throws BadRequestError if email or otpCode missing', async () => {
    await expect(verifyOtp(null, '123456')).rejects.toThrow('Email dan kode OTP');
  });
});
