import { jest } from '@jest/globals';

// Mock email sender
jest.unstable_mockModule('#shared/utils/email-sender.js', () => ({
  default: jest.fn().mockResolvedValue({ success: true }),
}));

const request = (await import('supertest')).default;
const app = (await import('#app/app.js')).default;
const User = (await import('#modules/user/user.model.js')).User;

describe('Auth Flow — Integration', () => {
  const userData = { username: 'flowuser', email: 'flow@example.com', password: 'password123' };

  describe('POST /api/auth/register', () => {
    test('201 — creates user and sends OTP', async () => {
      const res = await request(app).post('/api/auth/register').send(userData);
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
    });

    test('201 — duplicate email sends new OTP', async () => {
      const res = await request(app).post('/api/auth/register').send(userData);
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    test('400 — invalid OTP', async () => {
      await request(app).post('/api/auth/register').send(userData);
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: userData.email, otpCode: '000000' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    test('401 — wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noone@example.com', password: 'wrongpass' });
      expect(res.status).toBe(401);
    });
  });

  describe('Full flow: register → verify OTP → login → refresh → logout', () => {
    test('completes the full auth cycle', async () => {
      const regRes = await request(app).post('/api/auth/register').send(userData);
      expect(regRes.status).toBe(201);

      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();

      const otpRes = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: userData.email, otpCode: user.otpCode });
      expect(otpRes.status).toBe(200);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });
      expect(loginRes.status).toBe(200);
      const { accessToken, refreshToken } = loginRes.body.data;

      const meRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(meRes.status).toBe(200);

      const refreshRes = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(refreshRes.status).toBe(200);
      const newRefresh = refreshRes.body.data.refreshToken;

      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: newRefresh });
      expect(logoutRes.status).toBe(200);

      const afterLogoutRes = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(afterLogoutRes.status).toBe(401);
    });
  });

  describe('Protected routes without auth', () => {
    test('401 — no token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });

    test('401 — invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});
