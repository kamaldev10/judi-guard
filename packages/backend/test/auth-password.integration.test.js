import { jest } from '@jest/globals';

// Mock email sender
jest.unstable_mockModule('#shared/utils/email-sender.js', () => ({
  default: jest.fn().mockResolvedValue({ success: true }),
}));

const request = (await import('supertest')).default;
const app = (await import('#app/app.js')).default;
const User = (await import('#modules/user/user.model.js')).User;
const PasswordReset = (await import('#modules/auth/password-reset.model.js')).default;
const _sendEmail = (await import('#shared/utils/email-sender.js')).default;

describe('Auth Password — Integration', () => {
  const userData = { username: 'pwuser', email: 'pw@example.com', password: 'oldpassword123' };

  describe('POST /api/auth/forgot-password', () => {
    test('200 — always returns success even if email unknown', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'unknown@example.com' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ success: true });
    });
  });

  describe('Full resolver: forgot → reset → login → change', () => {
    test('completes the full password cycle', async () => {
      // 1. Create a verified user directly
      await User.create({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        isVerified: true,
      });

      // 2. Request forgot password
      const forgotRes = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: userData.email });

      expect(forgotRes.status).toBe(200);
      expect(forgotRes.body).toMatchObject({ success: true });

      // 3. Check reset token in DB
      const user = await User.findOne({ email: userData.email });
      const resetDoc = await PasswordReset.findOne({ userId: user._id });
      expect(resetDoc).toBeTruthy();
      expect(resetDoc.token).toBeDefined();

      // 4. Reset with valid token
      const resetRes = await request(app)
        .put(`/api/auth/reset-password/${resetDoc.token}`)
        .send({ password: 'newpassword123', confirmPassword: 'newpassword123' });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body).toMatchObject({ status: 'success' });

      // 5. Invalid reset token
      const invalidRes = await request(app)
        .put('/api/auth/reset-password/invalid-token')
        .send({ password: 'newpass456', confirmPassword: 'newpass456' });
      expect(invalidRes.status).toBe(400);

      // 6. Login with new password
      const loginNewRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'newpassword123' });
      expect(loginNewRes.status).toBe(200);
      const accessToken = loginNewRes.body.data.accessToken;

      // 7. Login with old password fails
      const loginOldRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'oldpassword123' });
      expect(loginOldRes.status).toBe(401);

      // 8. Change password
      const changeRes = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'newpassword123',
          newPassword: 'changedpass789',
          confirmPassword: 'changedpass789',
        });
      expect(changeRes.status).toBe(200);
      expect(changeRes.body).toMatchObject({ status: 'success' });

      // 9. Change with wrong current password
      const wrongRes = await request(app)
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'whatever123',
          confirmPassword: 'whatever123',
        });
      expect(wrongRes.status).toBe(401);
    });
  });
});
