import request from 'supertest';
import app from '#app/app.js';
import User from '#modules/user/user.model.js';
import { generateToken } from '#shared/utils/jwt.js';

describe('Auth & RBAC Integration Tests', () => {
  let firstUser;
  let secondUser;
  let firstUserToken;
  let secondUserToken;

  beforeEach(async () => {
    // Bersihkan database sebelum tes (setup.js juga membersihkannya, tapi mari kita pastikan)
    await User.deleteMany({});

    // 1. Registrasi user pertama (seharusnya otomatis jadi owner)
    const isFirstUser = (await User.countDocuments({})) === 0;
    
    firstUser = await User.create({
      username: 'owneruser',
      email: 'owner@example.com',
      password: 'password123',
      isVerified: true,
      role: isFirstUser ? 'owner' : 'member',
    });

    firstUserToken = generateToken({
      userId: firstUser._id.toString(),
      email: firstUser.email,
      role: firstUser.role,
    });

    // 2. Registrasi user kedua (seharusnya jadi member)
    const isSecondFirst = (await User.countDocuments({})) === 0;
    
    secondUser = await User.create({
      username: 'memberuser',
      email: 'member@example.com',
      password: 'password123',
      isVerified: true,
      role: isSecondFirst ? 'owner' : 'member',
    });

    secondUserToken = generateToken({
      userId: secondUser._id.toString(),
      email: secondUser.email,
      role: secondUser.role,
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
      expect(res.body.data.email).toBe('owner@example.com');
      expect(res.body.data.role).toBe('owner');
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
      // Endpoint '/api/config/whitelist' membutuhkan config:read yang dimiliki member, tetapi juga butuh youtube access
      const res = await request(app)
        .get('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`);
      
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Hubungkan akun YouTube terlebih dahulu');
    });

    test('Harus mengembalikan 403 jika izin dicabut melalui permissionOverrides deny', async () => {
      // Cabut izin profile:read untuk member secara eksplisit
      await User.findByIdAndUpdate(secondUser._id, {
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
      // Misalkan kita buat rute baru atau rute owner saja yang dicoba diakses oleh member
      // /api/analysis/report/preview membutuhkan permission 'analysis:report'
      // Member memilikinya secara default, tapi jika kita hilangkan dari default member atau uji rute lain:
      // Kita uji rute custom / configuration write. Member tidak boleh config:write secara default.
      // Mari kita pastikan member tidak bisa config:write (whitelist POST) secara default
      let res = await request(app)
        .post('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ keyword: 'test' });
      
      // Karena belum connect youtube, return 409 (bukan 403 karena permission dicocokkan dulu sebelum youtube check!)
      // Wait, let's check: requirePermission dipanggil SEBELUM requireYoutubeAccess!
      // Jadi jika permission lolos, ia lanjut ke requireYoutubeAccess dan mengembalikan 409.
      // Jika permission tidak lolos, ia mengembalikan 403.
      // Mari kita uji dengan permission yang member TIDAK punya secara default: 'workspace:read' (GET /api/workspace/members)
      // Di Fase 1 rute workspace belum diimplementasikan di app.js, tapi mari kita pastikan.
      // Untuk menguji 403 vs 409:
      // Mari verifikasi bahwa member tanpa config:write permissionOverrides akan lolos permission check (karena config:write tidak ada di default member default list, wait! Let's check require-permission DEFAULT_PERMISSIONS)
      // Default permissions untuk member: profile:read, profile:write, analysis:start, analysis:read, analysis:moderate, analysis:report, config:read, channel:read, youtube:connect.
      // Jadi member TIDAK punya 'config:write' secara default!
      // Jadi jika member melakukan POST ke /api/config/whitelist, ia harus mengembalikan 403 Forbidden!
      res = await request(app)
        .post('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ keyword: 'test' });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Akses ditolak untuk aksi ini');

      // Sekarang, kita grant 'config:write' secara eksplisit ke member
      await User.findByIdAndUpdate(secondUser._id, {
        permissionOverrides: {
          deny: [],
          grant: ['config:write'],
        },
      });

      res = await request(app)
        .post('/api/config/whitelist')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({ keyword: 'test' });

      // Sekarang permission lolos, dan lanjut ke requireYoutubeAccess yang mengembalikan 409 karena YouTube belum terhubung!
      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Hubungkan akun YouTube terlebih dahulu');
    });
  });

  describe('Deprecasi Rute Guest & Rute Analisis Lama', () => {
    test('/api/auth/guest/connect harus mengembalikan 410 Gone', async () => {
      const res = await request(app).get('/api/auth/guest/connect');
      expect(res.status).toBe(410);
      expect(res.body.message).toBe('Rute guest auth telah dinonaktifkan.');
    });

    test('/api/analysis/videos harus mengembalikan 410 Gone', async () => {
      const res = await request(app).post('/api/analysis/videos');
      expect(res.status).toBe(410);
      expect(res.body.message).toBe('Rute analisis lama ini telah dinonaktifkan. Silakan gunakan endpoint baru.');
    });
  });
});
