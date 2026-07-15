import * as configService from './configuration.service.js';
import { AppError } from '#shared/utils/errors.js';

/**
 * @openapi
 * /config/whitelist:
 *   post:
 *     tags: [Configuration]
 *     summary: Tambah whitelist
 *     description: Menambahkan channel ID ke whitelist (komentarnya akan diabaikan)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [channelId]
 *             properties:
 *               channelId:
 *                 type: string
 *               channelName:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Berhasil ditambahkan
 */
export const addWhitelist = async (req, res, next) => {
  try {
    const userId = req.auth.userId; // Middleware sets _id
    const { channelId } = req.body; // channelName & note opsional
    if (!channelId) throw new AppError('Channel ID wajib diisi', 400);
    const newItem = await configService.addToWhitelist(userId, req.body);
    res.status(201).json({ status: 'success', data: newItem });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /config/whitelist:
 *   get:
 *     tags: [Configuration]
 *     summary: Daftar whitelist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar whitelist
 */
export const getWhitelist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const list = await configService.getUserWhitelist(userId);
    res.status(200).json({ status: 'success', count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /config/whitelist/{id}:
 *   delete:
 *     tags: [Configuration]
 *     summary: Hapus whitelist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */
export const deleteWhitelist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    await configService.removeFromWhitelist(id, userId);
    res.status(204).json({
      status: 'success',
      message: 'Berhasil menghapus akun dari Whitelist.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /config/blacklist:
 *   post:
 *     tags: [Configuration]
 *     summary: Tambah blacklist
 *     description: Menambahkan kata kunci ke blacklist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keywords:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["slot", "togel"]
 *               keyword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Berhasil ditambahkan
 */
export const addBlacklist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const inputData = req.body.keywords || req.body.keyword;
    if (!inputData) {
      throw new AppError("Field 'keywords' (array) atau 'keyword' (string) wajib diisi.", 400);
    }
    const result = await configService.addBulkBlacklist(userId, inputData);
    res.status(201).json({
      status: 'success',
      message: `Berhasil menambahkan ${result.added.length} kata kunci.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /config/blacklist:
 *   get:
 *     tags: [Configuration]
 *     summary: Daftar blacklist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar blacklist
 */
export const getBlacklist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const list = await configService.getUserBlacklist(userId);
    res.status(200).json({ status: 'success', count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

/**
 * @openapi
 * /config/blacklist/{id}:
 *   delete:
 *     tags: [Configuration]
 *     summary: Hapus blacklist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Berhasil dihapus
 */
export const deleteBlacklist = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    await configService.removeFromBlacklist(id, userId);
    res.status(204).json({
      status: 'success',
      message: 'Berhasil menghapus kata kunci dari Blacklist.',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
