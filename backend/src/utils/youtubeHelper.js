// src/utils/youtubeHelper.js

/**
 * Mengambil YouTube Video ID dari berbagai format URL atau langsung dari ID.
 * @param {string} urlOrId - URL Video YouTube atau Video ID.
 * @returns {string|null} Video ID atau null jika tidak valid.
 */
const getYouTubeVideoId = (urlOrId) => {
  if (!urlOrId || typeof urlOrId !== "string") return null;

  const trimmedInput = urlOrId.trim();

  // 1. Cek apakah input adalah ID video yang valid (11 karakter alfanumerik, -, _)
  if (trimmedInput.length === 11 && /^[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
    return trimmedInput;
  }

  // 2. Jika bukan ID langsung, coba cocokkan dengan pola URL umum
  // Pola regex diurutkan dari yang lebih spesifik atau umum digunakan
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/, // Standard URL (parameter v bisa di mana saja)
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, // Embed URL
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/, // Shortened URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/, // V URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, // Shorts URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})/, // Live URL
  ];

  for (const pattern of patterns) {
    const match = trimmedInput.match(pattern);
    if (match && match[1]) {
      // Grup pertama (match[1]) seharusnya adalah ID video 11 karakter
      // Regex di atas sudah memastikan panjang 11 karakter untuk ID
      return match[1];
    }
  }

  // Jika tidak ada pola yang cocok
  return null;
};

module.exports = {
  getYouTubeVideoId,
};
