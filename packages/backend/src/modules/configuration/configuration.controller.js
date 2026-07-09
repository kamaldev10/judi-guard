import * as configService from './configuration.service.js';
import { AppError } from '#shared/utils/errors.js';

// --- CONTROLLER WHITELIST ---
export const addWhitelist = async (req, res, next) => {
  try {
    const userId = req.user._id; // Middleware sets _id
    const { channelId } = req.body; // channelName & note opsional
    if (!channelId) throw new AppError('Channel ID wajib diisi', 400);
    const newItem = await configService.addToWhitelist(userId, req.body);
    res.status(201).json({ status: 'success', data: newItem });
  } catch (error) {
    next(error);
  }
};

export const getWhitelist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const list = await configService.getUserWhitelist(userId);
    res.status(200).json({ status: 'success', count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const deleteWhitelist = async (req, res, next) => {
  try {
    const userId = req.user._id;
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

// --- CONTROLLER BLACKLIST ---
export const addBlacklist = async (req, res, next) => {
  try {
    const userId = req.user._id;
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

export const getBlacklist = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const list = await configService.getUserBlacklist(userId);
    res.status(200).json({ status: 'success', count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

export const deleteBlacklist = async (req, res, next) => {
  try {
    const userId = req.user._id;
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
