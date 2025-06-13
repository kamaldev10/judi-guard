const express = require("express");
const textPredictController = require("../controllers/textPredict.controller");

const router = express.Router();

// Rute ini yang akan dipanggil untuk fitur analisis teks tunggal
// Method: POST, URL Final: /api/text/predict
router.post("/predict", textPredictController.textPredict);

module.exports = router;
