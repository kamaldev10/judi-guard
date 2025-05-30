// src/api/routes/user.routes.js
const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated"); // Impor middleware
const userController = require("../controllers/user.controller"); // Akan kita buat controllernya

const router = express.Router();

// Rute ini akan dilindungi oleh middleware isAuthenticated
router.get("/me", isAuthenticated, userController.getMe);

// Rute lain terkait user bisa ditambahkan di sini
// router.patch('/updateMe', isAuthenticated, userController.updateMe);
// router.delete('/deleteMe', isAuthenticated, userController.deleteMe);

module.exports = router;
