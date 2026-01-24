const express = require("express");
const configController = require("../controllers/configuration.controller");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");

// Whitelist Routes
router.post("/whitelist", isAuthenticated, configController.addWhitelist);

router.get("/whitelist", isAuthenticated, configController.getWhitelist);

router.delete(
  "/whitelist/:id",
  isAuthenticated,
  configController.deleteWhitelist,
);

// Blacklist Routes
router.post("/blacklist", isAuthenticated, configController.addBlacklist);

router.get("/blacklist", isAuthenticated, configController.getBlacklist);

router.delete(
  "/blacklist/:id",
  isAuthenticated,
  configController.deleteBlacklist,
);

module.exports = router;
