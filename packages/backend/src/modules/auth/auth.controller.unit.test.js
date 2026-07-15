import { jest } from '@jest/globals';

// ── Mutable mock references ──
let mockGenerateAuthUrl = 'http://oauth.google.com/auth';

// ── Service mocks ──
const mockAuthService = {
  loginUser: jest.fn(),
  signInWithGoogle: jest.fn(),
};
const mockOtpService = {
  registerUser: jest.fn(),
  createGoogleUser: jest.fn(),
  verifyOtp: jest.fn(),
  setPasswordAfterOtp: jest.fn(),
  resendOtp: jest.fn(),
};
const mockPasswordService = {
  requestPasswordReset: jest.fn(),
  processPasswordReset: jest.fn(),
  changeUserPassword: jest.fn(),
};
const mockYoutubeOauthService = {
  handleYoutubeOAuthCallback: jest.fn(),
  disconnectYouTubeAccount: jest.fn(),
};
const mockTokenService = {
  refreshAccessToken: jest.fn(),
  blacklistAccessToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
};
const mockConfig = { apiUrl: 'http://localhost:3001' };

// ── Module mocks ──
jest.unstable_mockModule('#modules/auth/auth.service.js', () => ({ ...mockAuthService }));
jest.unstable_mockModule('#modules/auth/otp.service.js', () => ({ ...mockOtpService }));
jest.unstable_mockModule('#modules/auth/password.service.js', () => ({ ...mockPasswordService }));
jest.unstable_mockModule('#modules/auth/youtube-oauth.service.js', () => ({
  ...mockYoutubeOauthService,
}));
jest.unstable_mockModule('#modules/auth/token.service.js', () => ({ ...mockTokenService }));
jest.unstable_mockModule('#config/environment.js', () => ({ default: mockConfig }));
jest.unstable_mockModule('#shared/clients/google-oauth2.client.js', () => ({
  default: (_callbackUrl) => ({
    generateAuthUrl: () => mockGenerateAuthUrl,
  }),
}));

const {
  handleRegister,
  handleVerifyOtp,
  handleLogin,
  handleGoogleAuth,
  redirectToGoogleOAuth,
  handleGoogleOAuthCallback,
  handleDisconnectYouTube,
  handleForgotPassword,
  handleResetPassword,
  handleChangePassword,
  handleRefreshToken,
  handleLogout,
} = await import('./auth.controller.js');

const makeReq = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  auth: { userId: '507f1f77bcf86cd799439011', email: 'test@example.com' },
  ...overrides,
});

const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateAuthUrl = 'http://oauth.google.com/auth';
});

/* ───────── handleRegister ───────── */
describe('handleRegister', () => {
  test('calls otpService.registerUser and returns 201', async () => {
    const req = makeReq({ body: { username: 'new', email: 'a@b.com', password: 'pass123' } });
    const res = makeRes();
    mockOtpService.registerUser.mockResolvedValue({
      message: 'Success',
      user: { email: 'a@b.com' },
    });

    await handleRegister(req, res, jest.fn());

    expect(mockOtpService.registerUser).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: 'Pengguna berhasil didaftarkan! Silahkan verifikasi OTP terlebih dahulu.',
        data: { user: { message: 'Success', user: { email: 'a@b.com' } } },
      }),
    );
  });

  test('passes errors to next', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();
    const next = jest.fn();
    mockOtpService.registerUser.mockRejectedValue(new Error('Test error'));

    await handleRegister(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

/* ───────── handleVerifyOtp ───────── */
describe('handleVerifyOtp', () => {
  test('returns set_password_required for Google user', async () => {
    const req = makeReq({ body: { email: 'a@b.com', otpCode: '123456' } });
    const res = makeRes();
    mockOtpService.verifyOtp.mockResolvedValue({
      status: 'set_password_required',
      token: 'temp.token',
      message: 'Set password',
    });

    await handleVerifyOtp(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'set_password_required' }),
    );
  });

  test('returns accessToken, refreshToken for regular user', async () => {
    const req = makeReq({ body: { email: 'a@b.com', otpCode: '123456' } });
    const res = makeRes();
    mockOtpService.verifyOtp.mockResolvedValue({
      status: 'success',
      message: 'Verified',
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { email: 'a@b.com' },
    });

    await handleVerifyOtp(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: 'Verified',
        data: { accessToken: 'acc', refreshToken: 'ref', user: { email: 'a@b.com' } },
      }),
    );
  });
});

/* ───────── handleLogin ───────── */
describe('handleLogin', () => {
  test('returns tokenPair on success', async () => {
    const req = makeReq({ body: { email: 'a@b.com', password: 'pass123' } });
    const res = makeRes();
    mockAuthService.loginUser.mockResolvedValue({
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { email: 'a@b.com' },
    });

    await handleLogin(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: 'Login berhasil!',
        data: { accessToken: 'acc', refreshToken: 'ref', user: { email: 'a@b.com' } },
      }),
    );
  });
});

/* ───────── handleGoogleAuth ───────── */
describe('handleGoogleAuth', () => {
  test('returns otp_required for new Google user', async () => {
    const req = makeReq({ body: { idToken: 'google.token' } });
    const res = makeRes();
    mockAuthService.signInWithGoogle.mockResolvedValue({
      status: 'register_required',
      email: 'g@example.com',
      name: 'G User',
      picture: 'pic.jpg',
    });
    mockOtpService.createGoogleUser.mockResolvedValue({ email: 'g@example.com' });

    await handleGoogleAuth(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'otp_required',
        message: 'Silakan verifikasi email Anda dengan kode OTP yang telah dikirim.',
      }),
    );
  });

  test('returns tokenPair for existing Google user', async () => {
    const req = makeReq({ body: { idToken: 'google.token' } });
    const res = makeRes();
    mockAuthService.signInWithGoogle.mockResolvedValue({
      accessToken: 'acc',
      refreshToken: 'ref',
      user: { email: 'g@example.com' },
    });

    await handleGoogleAuth(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        message: 'Login dengan Google berhasil!',
        data: { accessToken: 'acc', refreshToken: 'ref', user: { email: 'g@example.com' } },
      }),
    );
  });
});

/* ───────── handleForgotPassword ───────── */
describe('handleForgotPassword', () => {
  test('handles USER_NOT_FOUND status', async () => {
    const req = makeReq({ body: { email: 'unknown@example.com' } });
    const res = makeRes();
    mockPasswordService.requestPasswordReset.mockResolvedValue({ status: 'USER_NOT_FOUND' });

    await handleForgotPassword(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message:
          'Jika alamat email Anda terdaftar di sistem kami dan terkait dengan kata sandi aplikasi, Anda akan menerima email berisi instruksi untuk mereset kata sandi Anda. Silakan periksa folder inbox dan spam Anda.',
      }),
    );
  });
});

/* ───────── handleResetPassword ───────── */
describe('handleResetPassword', () => {
  test('calls passwordService.processPasswordReset', async () => {
    const req = {
      params: { token: 'reset-token-123' },
      body: { password: 'new123', confirmPassword: 'new123' },
    };
    const res = makeRes();
    await handleResetPassword(req, res, jest.fn());

    expect(mockPasswordService.processPasswordReset).toHaveBeenCalledWith(
      'reset-token-123',
      'new123',
      'new123',
    );
  });
});

/* ───────── handleChangePassword ───────── */
describe('handleChangePassword', () => {
  test('calls passwordService.changeUserPassword', async () => {
    const req = makeReq({ body: { currentPassword: 'old123', newPassword: 'new123' } });
    const res = makeRes();
    await handleChangePassword(req, res, jest.fn());

    expect(mockPasswordService.changeUserPassword).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      'old123',
      'new123',
    );
  });
});

/* ───────── handleRefreshToken ───────── */
describe('handleRefreshToken', () => {
  test('returns new tokenPair', async () => {
    const req = makeReq({ body: { refreshToken: 'old.refresh' } });
    const res = makeRes();
    mockTokenService.refreshAccessToken.mockResolvedValue({
      accessToken: 'new.acc',
      refreshToken: 'new.ref',
    });

    await handleRefreshToken(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        data: { accessToken: 'new.acc', refreshToken: 'new.ref' },
      }),
    );
  });
});

/* ───────── handleLogout ───────── */
describe('handleLogout', () => {
  test('blacklists accessToken and revokes refreshToken', async () => {
    const req = makeReq({ body: { refreshToken: 'refresh.tok' } });
    const res = makeRes();
    await handleLogout(req, res, jest.fn());

    expect(mockTokenService.blacklistAccessToken).toHaveBeenCalledWith(req.auth);
    expect(mockTokenService.revokeRefreshToken).toHaveBeenCalledWith('refresh.tok');
    expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Berhasil logout.' });
  });
});

/* ───────── redirectToGoogleOAuth ───────── */
describe('redirectToGoogleOAuth', () => {
  test('returns authorizeUrl on success', async () => {
    const req = makeReq();
    const res = makeRes();
    await redirectToGoogleOAuth(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        data: { redirectUrl: 'http://oauth.google.com/auth' },
      }),
    );
  });
});

/* ───────── handleGoogleOAuthCallback ───────── */
describe('handleGoogleOAuthCallback', () => {
  test('redirects to error page if error param', async () => {
    const req = { query: { error: 'access_denied' } };
    const res = makeRes();
    await handleGoogleOAuthCallback(req, res, jest.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('status=error&msg=access_denied'),
    );
  });

  test('redirects to error if missing code/state', async () => {
    const req = { query: {} };
    const res = makeRes();
    await handleGoogleOAuthCallback(req, res, jest.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      expect.stringContaining('status=error&msg=InvalidCallbackParams'),
    );
  });
});

/* ───────── handleDisconnectYouTube ───────── */
describe('handleDisconnectYouTube', () => {
  test('calls youtubeOauthService.disconnectYouTubeAccount', async () => {
    const req = makeReq();
    const res = makeRes();
    await handleDisconnectYouTube(req, res, jest.fn());

    expect(mockYoutubeOauthService.disconnectYouTubeAccount).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
  });
});
