import { ForbiddenError } from '#shared/utils/errors.js';

/**
 * In-memory daily counter untuk explorer limits.
 * Key: `${userId}:${date}:${action}` → number
 * Reset otomatis setiap hari (dibedakan oleh tanggal di key).
 */
const explorerCounts = new Map();

const getDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Cek dan increment counter untuk explorer.
 * @param {string} action — 'analysis' | 'pdf' | 'moderate' | 'whitelist'
 * @param {number} max — Batas maksimal per hari
 * @returns {Function} Express middleware
 */
const checkExplorerLimit = (action, max) => {
  return (req, res, next) => {
    // Hanya berlaku untuk explorer
    if (!req.auth || req.auth.role !== 'explorer') {
      return next();
    }

    const key = `${req.auth.userId}:${getDateKey()}:${action}`;
    const current = explorerCounts.get(key) || 0;

    if (current >= max) {
      return next(new ForbiddenError(`Batas harian ${action} tercapai (${max}/${max}). Coba lagi besok.`));
    }

    explorerCounts.set(key, current + 1);
    next();
  };
};

export default checkExplorerLimit;
