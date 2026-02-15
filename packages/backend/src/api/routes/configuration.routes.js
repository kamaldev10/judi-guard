const express = require("express");
const configController = require("../controllers/configuration.controller");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const ensureYoutubeAccess = require("../middlewares/ensureYoutubeAccess");

router.use(isAuthenticated);

// Whitelist Routes
router.post("/whitelist", ensureYoutubeAccess, configController.addWhitelist);

router.get("/whitelist", configController.getWhitelist);

router.delete(
  "/whitelist/:id",

  configController.deleteWhitelist,
);

// Blacklist Routes
router.post("/blacklist", configController.addBlacklist);

router.get("/blacklist", configController.getBlacklist);

router.delete(
  "/blacklist/:id",

  configController.deleteBlacklist,
);

module.exports = router;
