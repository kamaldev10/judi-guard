import request from 'supertest';
import app from '#app/app.js';
import { User } from '#modules/user/user.model.js';
import { Workspace, WorkspaceMember } from '#modules/workspace/workspace.model.js';
import { generateToken } from '#shared/utils/jwt.js';

describe('Middleware Flow — Integration', () => {
  let explorerToken, ownerToken, memberToken;

  beforeEach(async () => {
    // Workspace owner
    const owner = await User.create({
      username: 'mid-owner',
      email: 'mid-owner@test.com',
      password: 'pass123',
      isVerified: true,
      role: 'owner',
    });
    const workspace = await Workspace.create({ name: 'Mid Test WS', ownerUserId: owner._id });
    await WorkspaceMember.create({ userId: owner._id, workspaceId: workspace._id, role: 'owner' });
    owner.workspaceId = workspace._id;
    await owner.save();

    // Regular member
    const member = await User.create({
      username: 'mid-member',
      email: 'mid-member@test.com',
      password: 'pass123',
      isVerified: true,
      workspaceId: workspace._id,
    });
    await WorkspaceMember.create({ userId: member._id, workspaceId: workspace._id, role: 'member' });

    // Explorer (no workspace)
    const explorer = await User.create({
      username: 'mid-explorer',
      email: 'mid-explorer@test.com',
      password: 'pass123',
      isVerified: true,
      role: 'explorer',
    });

    ownerToken = generateToken({
      userId: owner._id.toString(),
      email: owner.email,
      role: 'owner',
      workspaceId: workspace._id.toString(),
    });
    memberToken = generateToken({
      userId: member._id.toString(),
      email: member.email,
      role: 'member',
      workspaceId: workspace._id.toString(),
    });
    explorerToken = generateToken({
      userId: explorer._id.toString(),
      email: explorer.email,
      role: 'explorer',
    });
  });

  /* ─── Auth: requireAuth ─── */
  describe('requireAuth', () => {
    test('401 — no Authorization header', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Anda tidak login');
    });

    test('401 — invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    test('200 — valid explorer token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${explorerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('mid-explorer@test.com');
    });

    test('200 — owner token with workspace membership', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('mid-owner@test.com');
    });
  });

  /* ─── Permission: requirePermission ─── */
  describe('requirePermission', () => {
    test('403 — member without workspace:invite', async () => {
      const res = await request(app)
        .post('/api/workspace/members')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ email: 'new@test.com', role: 'member' });
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Akses ditolak untuk aksi ini');
    });

    test('200 — owner with workspace:read', async () => {
      const res = await request(app)
        .get('/api/workspace/members')
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(res.status).toBe(200);
    });
  });

  /* ─── Deprecated & unknown routes ─── */
  describe('Route handling', () => {
    test('404 — unknown route', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
    });

    test('410 — deprecated /api/auth/guest', async () => {
      const res = await request(app).get('/api/auth/guest');
      expect(res.status).toBe(410);
      expect(res.body.message).toBe('Rute guest auth telah dinonaktifkan.');
    });
  });
});
