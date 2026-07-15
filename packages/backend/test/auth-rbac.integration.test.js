import request from 'supertest';
import app from '#app/app.js';
import { User } from '#modules/user/user.model.js';
import { Workspace, WorkspaceMember } from '#modules/workspace/workspace.model.js';
import { generateToken } from '#shared/utils/jwt.js';

describe('Auth & RBAC Integration Tests', () => {
  let firstUser;
  let secondUser;
  let firstUserToken;
  let secondUserToken;
  let workspace;
  let secondMembership;

  beforeEach(async () => {
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await WorkspaceMember.deleteMany({});

    // 1. Buat owner user
    firstUser = await User.create({
      username: 'owneruser',
      email: 'owner@example.com',
      password: 'password123',
      isVerified: true,
    });

    // Workspace + membership for owner
    workspace = await Workspace.create({
      name: "Owner's Workspace",
      ownerUserId: firstUser._id,
    });
    await WorkspaceMember.create({
      userId: firstUser._id,
      workspaceId: workspace._id,
      role: 'owner',
    });
    firstUser.workspaceId = workspace._id;
    await firstUser.save();

    firstUserToken = generateToken({
      userId: firstUser._id.toString(),
      email: firstUser.email,
      role: 'owner',
      workspaceId: workspace._id.toString(),
    });

    // 2. Buat member user
    secondUser = await User.create({
      username: 'memberuser',
      email: 'member@example.com',
      password: 'password123',
      isVerified: true,
      workspaceId: workspace._id,
    });

    secondMembership = await WorkspaceMember.create({
      userId: secondUser._id,
      workspaceId: workspace._id,
      role: 'member',
    });

    secondUserToken = generateToken({
      userId: secondUser._id.toString(),
      email: secondUser.email,
      role: 'member',
      workspaceId: workspace._id.toString(),
    });
  });

  describe('Autentikasi (requireAuth)', () => {
    test('Harus mengembalikan 401 jika mengakses endpoint terproteksi tanpa token', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Anda tidak login');
    });

    test('Harus mengembalikan 401 jika token JWT tidak valid', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Anda tidak login');
    });

    test('Harus mengembalikan 200 dan data profil jika token JWT valid', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${firstUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('owner@example.com');
    });
  });

  describe('Otorisasi Permission (requirePermission)', () => {
    test('Owner harus memiliki akses ke profil (profile:read)', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${firstUserToken}`);

      expect(res.status).toBe(200);
    });

    test('Member harus mengembalikan 409 jika mengakses konfigurasi whitelist tapi YouTube belum terhubung', async () => {
      const res = await request(app)
        .get('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Hubungkan akun YouTube terlebih dahulu');
    });

    test('Harus mengembalikan 403 jika izin dicabut melalui permissionOverrides deny', async () => {
      // Cabut izin profile:read untuk member via WorkspaceMember (bukan User!)
      await WorkspaceMember.findByIdAndUpdate(secondMembership._id, {
        permissionOverrides: {
          deny: ['profile:read'],
          grant: [],
        },
      });

      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${secondUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Akses ditolak untuk aksi ini');
    });

    test('Harus mengizinkan akses jika izin diberikan secara eksplisit melalui permissionOverrides grant', async () => {
      // Member TIDAK punya config:write secara default (cek DEFAULT_PERMISSIONS member).
      // Tapi POST /api/config/whitelist butuh config:write + requireYoutubeAccess.
      // Pertama pastikan 403 karena tidak punya config:write
      let res = await request(app)
        .post('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ keyword: 'test' });

      // Member tidak punya config:write → 403 Forbidden
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Akses ditolak untuk aksi ini');

      // Grant config:write secara eksplisit via WorkspaceMember
      await WorkspaceMember.findByIdAndUpdate(secondMembership._id, {
        permissionOverrides: {
          deny: [],
          grant: ['config:write'],
        },
      });

      res = await request(app)
        .post('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ keyword: 'test' });

      // Sekarang permission lolos, lanjut ke requireYoutubeAccess → 409 (YouTube blm terhubung)
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Hubungkan akun YouTube terlebih dahulu');
    });
  });

  describe('Deprecasi Rute Guest & Rute Analisis Lama', () => {
    test('/api/auth/guest harus mengembalikan 410 Gone', async () => {
      const res = await request(app).get('/api/auth/guest');
      expect(res.status).toBe(410);
      expect(res.body.message).toBe('Rute guest auth telah dinonaktifkan.');
    });

    test('/api/analysis/videos harus mengembalikan 410 Gone', async () => {
      const res = await request(app).post('/api/analysis/videos');
      expect(res.status).toBe(410);
      expect(res.body.message).toBe(
        'Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.',
      );
    });
  });
});
