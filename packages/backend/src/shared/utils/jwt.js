import jwt from 'jsonwebtoken';
import config from '#config/environment.js';
import crypto from 'crypto';

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('Invalid token:', error.message);
    return null;
  }
};

export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
