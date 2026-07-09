import express from 'express';
import { textPredictController } from './text-predict.controller.js';

const router = express.Router();

router.post('/', textPredictController);

export default router;
