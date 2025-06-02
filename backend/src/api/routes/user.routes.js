// src/api/routes/user.routes.js
const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const userController = require("../controllers/user.controller");

const router = express.Router();

// Rute ini akan dilindungi oleh middleware isAuthenticated
router.get("/me", isAuthenticated, userController.getMe);

// Rute untuk memperbarui data user saat ini (PATCH)
router.patch("/updateMe", isAuthenticated, userController.updateMe);

// Rute untuk menghapus akun user saat ini (DELETE)
router.delete("/deleteMe", isAuthenticated, userController.deleteMe);

module.exports = router;
