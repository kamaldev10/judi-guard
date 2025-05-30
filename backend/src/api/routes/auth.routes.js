// src/api/routes/auth.routes.js
const express = require("express");
const authController = require("../controllers/auth.controller");
const validateRequest = require("../middlewares/validateRequest");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const isAuthenticated = require("../middlewares/isAuthenticated"); // Impor isAuthenticated

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema, "body"),
  authController.handleRegister
);
router.post(
  "/login",
  validateRequest(loginSchema, "body"),
  authController.handleLogin
);

router.get(
  "/youtube/connect",
  isAuthenticated,
  authController.redirectToGoogleOAuth
);

router.get("/youtube/callback", authController.handleGoogleOAuthCallback);

module.exports = router;
