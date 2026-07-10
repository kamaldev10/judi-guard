import express from 'express';
import authRoutes from '#modules/auth/auth.routes.js';
import userRoutes from '#modules/user/user.routes.js';
import videoAnalysisRoutes from '#modules/video-analysis/video-analysis.routes.js';
import textPredictRoutes from '#modules/text-predict/text-predict.routes.js';
import studioRoutes from '#modules/studio/studio.routes.js';
import channelRoutes from '#modules/channel/channel.routes.js';
import configurationRoutes from '#modules/configuration/configuration.routes.js';
import workspaceRoutes from '#modules/workspace/workspace.routes.js';

const apiRouter = express.Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Memeriksa status server apakah berjalan dengan baik
 *     responses:
 *       200:
 *         description: Server sehat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 uptime:
 *                   type: number
 *                 environment:
 *                   type: string
 *                   example: development
 *                 message:
 *                   type: string
 *                   example: Judi Guard API is healthy 💪
 */
apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    message: 'Judi Guard API is healthy 💪',
  });
});

// Mount modular routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/analysis', videoAnalysisRoutes);
apiRouter.use('/studio', studioRoutes);
apiRouter.use('/predict', textPredictRoutes);
apiRouter.use('/videos', channelRoutes);
apiRouter.use('/config', configurationRoutes);
apiRouter.use('/workspace', workspaceRoutes);

export default apiRouter;
