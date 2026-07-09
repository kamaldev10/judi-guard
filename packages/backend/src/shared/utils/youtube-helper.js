const getYouTubeVideoId = (urlOrId) => {
  if (!urlOrId || typeof urlOrId !== 'string') return null;

  const trimmedInput = urlOrId.trim();

  if (trimmedInput.length === 11 && /^[a-zA-Z0-9_-]+$/.test(trimmedInput)) {
    return trimmedInput;
  }

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
      return match[1];
    }
  }

  return null;
};

export default { getYouTubeVideoId };
