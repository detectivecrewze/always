export function getSecretMediaType(src) {
  if (!src || typeof src !== 'string') return 'none';

  const normalized = src.trim().toLowerCase();
  const pathname = normalized.split(/[?#]/)[0];

  if (/\.(mp4|webm|mov|m4v)$/.test(pathname) || normalized.includes('/video/upload/')) {
    return 'video';
  }
  if (
    /\.(jpe?g|png|gif|webp|avif)$/.test(pathname)
    || normalized.includes('/image/upload/')
    || normalized.includes('for-you-always')
  ) {
    return 'image';
  }
  return 'link';
}

export function isSecretVideoUrl(src) {
  return getSecretMediaType(src) === 'video';
}
