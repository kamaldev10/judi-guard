import { jest } from '@jest/globals';

// ── Mutable mocks ──
const mockUserRepo = {
  findByEmailWithPasswordAndGoogleId: jest.fn(),
  findByIdWithPassword: jest.fn(),
  findById: jest.fn(),
};
const mockPasswordReset = {
  deleteMany: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
  deleteOne: jest.fn(),
};
const mockSendEmail = jest.fn();
const mockGenerateRandomToken = jest.fn();
const mockEmailTemplates = {
  passwordReset: jest.fn(({ username, resetUrl: _resetUrl }) => ({
    subject: 'Reset Password',
    text: `Hi ${username}`,
    html: '',
  })),
  passwordResetConfirmation: jest.fn(({ username }) => ({
    subject: 'Password Changed',
    text: `Hi ${username}`,
    html: '',
  })),
  passwordChangeNotification: jest.fn(({ username }) => ({
    subject: 'Password Changed',
    text: `Hi ${username}`,
    html: '',
  })),
};
const mockTokenService = { revokeUserTokens: jest.fn() };
const mockConfig = { frontendUrl: 'http://localhost:5173' };

jest.unstable_mockModule('#modules/user/user.repository.js', () => ({
  UserRepository: mockUserRepo,
}));
jest.unstable_mockModule('./password-reset.model.js', () => ({ default: mockPasswordReset }));
jest.unstable_mockModule('#shared/utils/email-sender.js', () => ({ default: mockSendEmail }));
jest.unstable_mockModule('#shared/utils/jwt.js', () => ({
  generateRandomToken: mockGenerateRandomToken,
}));
jest.unstable_mockModule('#shared/email-templates/index.js', () => mockEmailTemplates);
jest.unstable_mockModule('#modules/auth/token.service.js', () => mockTokenService);
jest.unstable_mockModule('#config/environment.js', () => ({ default: mockConfig }));

const { requestPasswordReset, processPasswordReset, changeUserPassword } =
  await import('./password.service.js');

const makeUser = (overrides = {}) => ({
  _id: 'u123',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashed123',
  googleId: null,
  role: 'explorer',
  workspaceId: null,
  comparePassword: jest.fn(),
  save: jest.fn(),
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
});

/* ───────── requestPasswordReset ───────── */
describe('requestPasswordReset', () => {
  test('returns USER_NOT_FOUND when email does not exist', async () => {
    mockUserRepo.findByEmailWithPasswordAndGoogleId.mockResolvedValue(null);
    const result = await requestPasswordReset('unknown@example.com');
    expect(result).toEqual({ status: 'USER_NOT_FOUND' });
  });

  test('returns IS_GOOGLE_ONLY_ACCOUNT when user has googleId but no password', async () => {
    mockUserRepo.findByEmailWithPasswordAndGoogleId.mockResolvedValue(
      makeUser({ googleId: 'g123', password: null }),
    );
    const result = await requestPasswordReset('google@example.com');
    expect(result).toMatchObject({ status: 'IS_GOOGLE_ONLY_ACCOUNT' });
  });

  test('creates reset token and sends email on success', async () => {
    mockUserRepo.findByEmailWithPasswordAndGoogleId.mockResolvedValue(makeUser());
    mockGenerateRandomToken.mockReturnValue('reset-token-123');
    mockSendEmail.mockResolvedValue({ success: true });

    const result = await requestPasswordReset('test@example.com');

    expect(mockPasswordReset.deleteMany).toHaveBeenCalledWith({ userId: 'u123' });
    expect(mockPasswordReset.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u123', token: 'reset-token-123' }),
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' }),
    );
    expect(result).toEqual({ status: 'RESET_EMAIL_SENT' });
  });

  test('returns EMAIL_SEND_FAILED when sendEmail fails', async () => {
    mockUserRepo.findByEmailWithPasswordAndGoogleId.mockResolvedValue(makeUser());
    mockGenerateRandomToken.mockReturnValue('reset-token-456');
    mockSendEmail.mockResolvedValue({ success: false, error: new Error('SMTP error') });

    const result = await requestPasswordReset('test@example.com');

    expect(result.status).toBe('EMAIL_SEND_FAILED');
    expect(mockPasswordReset.deleteOne).toHaveBeenCalled();
  });
});

/* ───────── processPasswordReset ───────── */
describe('processPasswordReset', () => {
  const token = 'plain-token';
  const _hashedToken = '6e4c2c3e0f54e8e2c7cc73070a178f4dfcb59830ff607d4597f33f23e4e0e0fb'; // sha256 of 'plain-token'

  test('throws BadRequestError when token not found', async () => {
    mockPasswordReset.findOne.mockResolvedValue(null);
    await expect(processPasswordReset(token, 'newPass1')).rejects.toThrow(
      'Token reset tidak valid',
    );
  });

  test('throws BadRequestError when token expired', async () => {
    mockPasswordReset.findOne.mockResolvedValue({
      userId: 'u123',
      expiresAt: new Date(Date.now() - 1000),
      _id: 'entry1',
    });
    await expect(processPasswordReset(token, 'newPass1')).rejects.toThrow('sudah kedaluwarsa');
  });

  test('updates password, revokes tokens, sends confirmation email', async () => {
    const user = makeUser();
    mockPasswordReset.findOne.mockResolvedValue({
      userId: 'u123',
      expiresAt: new Date(Date.now() + 86400000),
      _id: 'entry1',
    });
    mockUserRepo.findById.mockResolvedValue(user);
    mockSendEmail.mockResolvedValue({ success: true });

    await processPasswordReset(token, 'newPassword123');

    expect(user.password).toBe('newPassword123');
    expect(user.save).toHaveBeenCalled();
    expect(mockPasswordReset.findByIdAndDelete).toHaveBeenCalledWith('entry1');
    expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('u123');
  });
});

/* ───────── changeUserPassword ───────── */
describe('changeUserPassword', () => {
  test('throws NotFoundError when user not found', async () => {
    mockUserRepo.findByIdWithPassword.mockResolvedValue(null);
    await expect(changeUserPassword('u123', 'old', 'new123')).rejects.toThrow(
      'Pengguna tidak ditemukan',
    );
  });

  test('throws BadRequestError when user has no password', async () => {
    mockUserRepo.findByIdWithPassword.mockResolvedValue(makeUser({ password: null }));
    await expect(changeUserPassword('u123', 'old', 'new123')).rejects.toThrow(
      'belum mengatur password lokal',
    );
  });

  test('throws UnauthorizedError when current password is wrong', async () => {
    const user = makeUser();
    user.comparePassword.mockResolvedValue(false);
    mockUserRepo.findByIdWithPassword.mockResolvedValue(user);
    await expect(changeUserPassword('u123', 'wrong', 'new123')).rejects.toThrow(
      'Password saat ini',
    );
  });

  test('throws BadRequestError when new password equals current', async () => {
    const user = makeUser();
    user.comparePassword.mockResolvedValue(true);
    mockUserRepo.findByIdWithPassword.mockResolvedValue(user);
    await expect(changeUserPassword('u123', 'same', 'same')).rejects.toThrow('tidak boleh sama');
  });

  test('updates password, revokes tokens, sends notification', async () => {
    const user = makeUser();
    user.comparePassword.mockResolvedValue(true);
    mockUserRepo.findByIdWithPassword.mockResolvedValue(user);
    mockSendEmail.mockResolvedValue({ success: true });

    await changeUserPassword('u123', 'oldPass', 'newStrong1');

    expect(user.password).toBe('newStrong1');
    expect(user.save).toHaveBeenCalled();
    expect(mockTokenService.revokeUserTokens).toHaveBeenCalledWith('u123');
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' }),
    );
  });
});
