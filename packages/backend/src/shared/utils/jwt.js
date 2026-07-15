import jwt from 'jsonwebtoken';
import config from '#config/environment.js';
import crypto from 'crypto';

export const generateToken = (payload) => {
  return jwt.sign({ ...payload, jti: payload.jti || crypto.randomUUID() }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('TOKEN_INVALID');
    }
    throw error;
  }
};

export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
