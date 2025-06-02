// src/utils/jwt.js
const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const crypto = require("crypto");

/**
 * Menghasilkan JWT untuk user.
 * @param {object} payload - Payload untuk JWT (biasanya berisi userId).
 * @returns {string} Token JWT.
 */

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Memverifikasi JWT.
 * @param {string} token - Token JWT yang akan diverifikasi.
 * @returns {object|null} Payload jika token valid, null jika tidak.
 */

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    // Tangani error token (misalnya, TokenExpiredError, JsonWebTokenError)
    // console.error('Invalid token:', error.message);
    return null;
  }
};

const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomToken,
};
