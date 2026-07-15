import { WhitelistRepository, BlacklistRepository } from './configuration.repository.js';
import { UserRepository } from '#modules/user/user.repository.js';
import * as youtubeService from '#shared/services/youtube.service.js';
import { AppError } from '#shared/utils/errors.js';
import { DEFAULT_GAMBLING_KEYWORDS } from '#shared/constants/gambling-keywords.js';

// --- SERVICE WHITELIST ---

export const addToWhitelist = async (userId, data) => {
  let { channelId, channelName, note } = data;

  // Jika user input "@sesuatu", kita cari ID aslinya dulu
  if (channelId.startsWith('@')) {
    // 1. Ambil Token User dari DB (karena config.service dipanggil via 'protect' yg tdk bawa token)
    const user = await UserRepository.findByIdWithTokens(userId);

    if (!user || !user.youtubeAccessToken) {
      throw new AppError(
        'Anda harus menghubungkan akun YouTube untuk menggunakan fitur pencarian via Handle (@).',
        401,
      );
    }

    const tokens = {
      access_token: user.youtubeAccessToken,
      refresh_token: user.youtubeRefreshToken,
    };

    const channelInfo = await youtubeService.getChannelInfoByHandle(tokens, channelId);

    channelId = channelInfo.channelId;
    channelName = channelInfo.channelName;
    if (!note) note = `Resolved from handle: ${data.channelId}`;
  }

  // --- SIMPAN KE DB ---
  try {
    const newItem = await WhitelistRepository.create({
      userId,
      channelId,
      channelName: channelName || 'Unknown',
      note,
    });
    return newItem;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Channel ini sudah ada di whitelist Anda.', 400);
    }
    throw error;
  }
};

export const getUserWhitelist = async (userId) => {
  return await WhitelistRepository.findByUserId(userId);
};

export const removeFromWhitelist = async (id, userId) => {
  // Kita pastikan user hanya menghapus punya dia sendiri (security)
  const deleted = await WhitelistRepository.deleteByIdAndUserId(id, userId);
  if (!deleted) {
    throw new AppError('Data tidak ditemukan atau bukan milik Anda.', 404);
  }
  return deleted;
};

// --- SERVICE BLACKLIST ---

export const addBulkBlacklist = async (userId, inputRaw) => {
  // 1. Pastikan input berupa array. Jika string tunggal, bungkus jadi array.
  let keywordsArray = Array.isArray(inputRaw) ? inputRaw : [inputRaw];

  // Filter input kosong/null
  keywordsArray = keywordsArray.filter((k) => k && typeof k === 'string' && k.length > 0);

  if (keywordsArray.length === 0) {
    throw new AppError('Input kata kunci tidak boleh kosong.', 400);
  }

  const report = {
    added: [],
    skipped_default: [],
    skipped_duplicate: [],
    total_requested: keywordsArray.length,
  };

  // 2. Deduplikasi Input (Hapus kata kembar dalam request yg sama)
  // Kita gunakan Set, tapi kali ini menyimpan format ASLI (Natural)
  const uniqueInputs = Array.from(new Set(keywordsArray));

  const candidates = [];

  // 3. Filter Tahap 1: Cek Default Rules (Case-Insensitive Check)
  // Walaupun simpan natural, kita tetap cegah user simpan "SLOT" jika "slot" sudah default.
  uniqueInputs.forEach((word) => {
    const wordCheck = word.toLowerCase().trim(); // Normalisasi HANYA untuk pengecekan

    if (DEFAULT_GAMBLING_KEYWORDS.includes(wordCheck)) {
      report.skipped_default.push(word);
    } else {
      candidates.push(word); // Masukkan kata ASLI ke kandidat
    }
  });

  if (candidates.length === 0) {
    return report;
  }

  // 4. Filter Tahap 2: Cek Database (Apakah user sudah pernah simpan kata PERSIS ini?)
  const existingDocs = await BlacklistRepository.findByUserIdAndKeywords(userId, candidates);

  const existingKeywords = new Set(existingDocs.map((d) => d.keyword));

  // 5. Tentukan Final Insert
  const toInsert = [];

  candidates.forEach((word) => {
    if (existingKeywords.has(word)) {
      report.skipped_duplicate.push(word);
    } else {
      toInsert.push({ userId, keyword: word }); // Simpan format ASLI
      report.added.push(word);
    }
  });

  // 6. Eksekusi Bulk Insert
  if (toInsert.length > 0) {
    await BlacklistRepository.insertMany(toInsert);
  }

  return report;
};

export const getUserBlacklist = async (userId) => {
  return await BlacklistRepository.findByUserId(userId);
};

export const removeFromBlacklist = async (id, userId) => {
  const deleted = await BlacklistRepository.deleteByIdAndUserId(id, userId);
  if (!deleted) {
    throw new AppError('Data tidak ditemukan atau bukan milik Anda.', 404);
  }
  return deleted;
};
