const configService = require("../services/configuration.service"); // Import Service
const { AppError } = require("../../utils/errors");

// --- CONTROLLER WHITELIST ---

const addWhitelist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { channelId } = req.body; // channelName & note opsional

    if (!channelId) throw new AppError("Channel ID wajib diisi", 400);

    const newItem = await configService.addToWhitelist(userId, req.body);

    res.status(201).json({ status: "success", data: newItem });
  } catch (error) {
    next(error);
  }
};

const getWhitelist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await configService.getUserWhitelist(userId);

    res.status(200).json({ status: "success", count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const deleteWhitelist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // ID dokumen MongoDB (bukan channelId)

    await configService.removeFromWhitelist(id, userId);

    res.status(204).json({
      status: "success",
      message: "Berhasil menghapus akun dari Whitelist.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

// --- CONTROLLER BLACKLIST ---

const addBlacklist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Tangkap Input: Bisa dari 'keywords' (array) atau 'keyword' (string)
    // Prioritaskan 'keywords' jika keduanya dikirim
    const inputData = req.body.keywords || req.body.keyword;

    if (!inputData) {
      throw new AppError(
        "Field 'keywords' (array) atau 'keyword' (string) wajib diisi.",
        400,
      );
    }

    // 2. Panggil Service (Service yg akan handle logic array/string nya)
    const result = await configService.addBulkBlacklist(userId, inputData);

    res.status(201).json({
      status: "success",
      message: `Berhasil menambahkan ${result.added.length} kata kunci.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getBlacklist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const list = await configService.getUserBlacklist(userId);

    res.status(200).json({ status: "success", count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const deleteBlacklist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await configService.removeFromBlacklist(id, userId);

    res.status(204).json({
      status: "success",
      message: "Berhasil menghapus kata kunci dari Blacklist.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addWhitelist,
  getWhitelist,
  deleteWhitelist,
  addBlacklist,
  getBlacklist,
  deleteBlacklist,
};
