import request from 'supertest';
import app from '#app/app.js';
import { User } from '#modules/user/user.model.js';
import { Workspace, WorkspaceMember } from '#modules/workspace/workspace.model.js';
import { generateToken } from '#shared/utils/jwt.js';

describe('Workspace Module Integration Tests', () => {
  let ownerUser;
  let adminUser;
  let memberUser;
  let outsiderUser;

  let ownerToken;
  let adminToken;
  let memberToken;
  let _outsiderToken;

  let workspace;

  beforeEach(async () => {
    await User.deleteMany({});
    await Workspace.deleteMany({});
    await WorkspaceMember.deleteMany({});

    // 1. Buat Owner User
    ownerUser = await User.create({
      username: 'owneruser',
      email: 'owner@example.com',
      password: 'password123',
      isVerified: true,
    });

    // Simulasi inisialisasi default workspace oleh requireAuth saat hit pertama
    workspace = await Workspace.create({
      name: "Owner's Workspace",
      ownerUserId: ownerUser._id,
    });

    await WorkspaceMember.create({
      userId: ownerUser._id,
      workspaceId: workspace._id,
      role: 'owner',
    });

    ownerUser.workspaceId = workspace._id;
    await ownerUser.save();

    ownerToken = generateToken({
      userId: ownerUser._id.toString(),
      email: ownerUser.email,
      role: 'owner',
      workspaceId: workspace._id.toString(),
    });

    // 2. Buat Admin User (anggota)
    adminUser = await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'password123',
      isVerified: true,
      workspaceId: workspace._id,
    });

    await WorkspaceMember.create({
      userId: adminUser._id,
      workspaceId: workspace._id,
      role: 'admin',
    });

    adminToken = generateToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: 'admin',
      workspaceId: workspace._id.toString(),
    });

    // 3. Buat Member User (anggota)
    memberUser = await User.create({
      username: 'memberuser',
      email: 'member@example.com',
      password: 'password123',
      isVerified: true,
      workspaceId: workspace._id,
    });

    await WorkspaceMember.create({
      userId: memberUser._id,
      workspaceId: workspace._id,
      role: 'member',
    });

    memberToken = generateToken({
      userId: memberUser._id.toString(),
      email: memberUser.email,
      role: 'member',
      workspaceId: workspace._id.toString(),
    });

    // 4. Buat Outsider User (bukan anggota workspace ini)
    outsiderUser = await User.create({
      username: 'outsideruser',
      email: 'outsider@example.com',
      password: 'password123',
      isVerified: true,
    });

    const outsiderWorkspace = await Workspace.create({
      name: "Outsider's Workspace",
      ownerUserId: outsiderUser._id,
    });

    await WorkspaceMember.create({
      userId: outsiderUser._id,
      workspaceId: outsiderWorkspace._id,
      role: 'owner',
    });

    outsiderUser.workspaceId = outsiderWorkspace._id;
    await outsiderUser.save();

    _outsiderToken = generateToken({
      userId: outsiderUser._id.toString(),
      email: outsiderUser.email,
      role: 'owner',
      workspaceId: outsiderWorkspace._id.toString(),
    });
  });

  describe('GET /api/workspace/members (workspace:read)', () => {
    test('Owner & Admin harus dapat membaca daftar anggota', async () => {
      const res = await request(app)
        .get('/api/workspace/members')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3); // owner, admin, member
    });

    test('Member biasa tidak boleh membaca daftar anggota (403)', async () => {
      const res = await request(app)
        .get('/api/workspace/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/workspace/members (workspace:invite)', () => {
    test('Owner harus dapat mengundang user lain yang terdaftar di database', async () => {
      // Buat user baru di luar workspace
      const newUser = await User.create({
        username: 'inviteduser',
        email: 'invited@example.com',
        password: 'password123',
        isVerified: true,
      });

      const res = await request(app)
        .post('/api/workspace/members')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'invited@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.data.role).toBe('member');

      // Pastikan data tersimpan di DB
      const dbMember = await WorkspaceMember.findOne({
        userId: newUser._id,
        workspaceId: workspace._id,
      });
      expect(dbMember).toBeDefined();
    });

    test('Harus mengembalikan 404 jika email user tidak terdaftar', async () => {
      const res = await request(app)
        .post('/api/workspace/members')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(404);
    });

    test('Harus mengembalikan 409 jika user sudah menjadi anggota', async () => {
      const res = await request(app)
        .post('/api/workspace/members')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ email: 'admin@example.com' });

      expect(res.status).toBe(409);
    });
  });

  describe('DELETE /api/workspace/members/:userId (workspace:remove)', () => {
    test('Owner harus dapat mengeluarkan anggota', async () => {
      const res = await request(app)
        .delete(`/api/workspace/members/${memberUser._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);

      // Verifikasi di DB
      const dbMember = await WorkspaceMember.findOne({
        userId: memberUser._id,
        workspaceId: workspace._id,
      });
      expect(dbMember).toBeNull();
    });

    test('Admin tidak boleh mengeluarkan anggota (403)', async () => {
      const res = await request(app)
        .delete(`/api/workspace/members/${memberUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(403);
    });

    test('Owner tidak boleh dikeluarkan dari workspace sendiri (400)', async () => {
      const res = await request(app)
        .delete(`/api/workspace/members/${ownerUser._id}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('tidak dapat dihapus');
    });
  });

  describe('PATCH /api/workspace/members/:userId/role (workspace:assign-role)', () => {
    test('Owner harus dapat merubah role anggota (misal member jadi admin)', async () => {
      const res = await request(app)
        .patch(`/api/workspace/members/${memberUser._id}/role`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('admin');

      // Verifikasi di DB
      const dbMember = await WorkspaceMember.findOne({
        userId: memberUser._id,
        workspaceId: workspace._id,
      });
      expect(dbMember.role).toBe('admin');
    });

    test('Admin tidak boleh merubah role anggota (403)', async () => {
      const res = await request(app)
        .patch(`/api/workspace/members/${memberUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/workspace/members/:userId/permissions (rbac:assign-permission)', () => {
    test('Owner harus dapat menambahkan permissionOverrides', async () => {
      const res = await request(app)
        .patch(`/api/workspace/members/${memberUser._id}/permissions`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          grant: ['config:write'],
          deny: ['profile:read'],
        });

      expect(res.status).toBe(200);
      expect(res.body.data.permissionOverrides.grant).toContain('config:write');
      expect(res.body.data.permissionOverrides.deny).toContain('profile:read');
    });

    test('Admin tidak boleh menambahkan permissionOverrides (403)', async () => {
      const res = await request(app)
        .patch(`/api/workspace/members/${memberUser._id}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          grant: ['config:write'],
        });

      expect(res.status).toBe(403);
    });

    test('Permission overrides harus memiliki efek nyata pada akses endpoint', async () => {
      // 1. Awalnya, member boleh mengedit profil (default member punya profile:write)
      const initialRes = await request(app)
        .patch('/api/users/updateMe')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ fullName: 'New Member Name' });
      expect(initialRes.status).not.toBe(403);

      // 2. Owner meng-override dan memasukkan profile:write ke daftar deny
      await request(app)
        .patch(`/api/workspace/members/${memberUser._id}/permissions`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          deny: ['profile:write'],
        });

      // 3. Member mencoba mengedit profil lagi, sekarang harus 403 Forbidden!
      const afterOverrideRes = await request(app)
        .patch('/api/users/updateMe')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ fullName: 'Blocked Name' });

      expect(afterOverrideRes.status).toBe(403);
    });
  });
});
