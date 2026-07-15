import User from '#modules/user/user.model.js';
import request from 'supertest';
import app from '#app/app.js';

export const createVerifiedUser = async (overrides = {}) => {
  const user = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    isVerified: true,
    role: 'explorer',
    ...overrides,
  });
  return user;
};

export const loginAs = async (email = 'test@example.com', password = 'password123') => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.data; // { accessToken, refreshToken, user }
};
