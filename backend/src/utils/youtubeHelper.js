// src/utils/youtubeHelper.js

/**
 * Mengambil YouTube Video ID dari berbagai format URL.
 * @param {string} url - URL Video YouTube.
 * @returns {string|null} Video ID atau null jika tidak valid.
 */
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  // Pola regex untuk mencocokkan berbagai format URL YouTube
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/, // Standard URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/, // Embed URL
    /(?:https?:\/\/)?youtu\.be\/([^?]+)/, // Shortened URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^?]+)/, // V URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^?]+)/, // Shorts URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([^?]+)/, // Live URL
    /^[a-zA-Z0-9_-]{11}$/, // Langsung ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      // Pastikan ID yang didapat adalah 11 karakter (standar YouTube Video ID)
      if (match[1].length === 11) {
        return match[1];
      }
      // Jika pola terakhir (langsung ID) cocok dan panjangnya 11
      if (pattern.toString() === "/^[a-zA-Z0-9_-]{11}$/" && url.length === 11) {
        return url;
      }
    }
  }
  // Jika URL adalah ID video itu sendiri (11 karakter)
  if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
    return url;
  }

  return null;
};

module.exports = {
  getYouTubeVideoId,
};
