import connectDB from '#config/database.js';
import config from '#config/environment.js';
import User from '#modules/user/user.model.js';

const seedSuperuser = async () => {
  const { email, password } = config.superuser;

  if (!email || !password) {
    console.log('⚠️  SUPERUSER_EMAIL / SUPERUSER_PASSWORD not set. Skipping seed.');
    process.exit(0);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`ℹ️  Superuser ${email} already exists. Skipping.`);
    process.exit(0);
  }

  await User.create({
    username: 'superuser',
    email,
    password,
    role: 'superuser',
    isVerified: true,
  });

  console.log(`✅ Superuser created: ${email}`);
  process.exit(0);
};

seedSuperuser().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
