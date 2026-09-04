import fs from 'fs';
import path from 'path';
import { isKVConfigured } from './kv.js';

const KV_BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}`;

const kvHeaders = () => ({
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  'Content-Type': 'application/json',
});

/**
 * Generate a cryptographically distinct, timestamp-prefixed ID
 */
export function generateWishId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Save a wish with discrete anti-collision key schema:
 * KV: wish:${slug}:${wishId}
 * FS: data/wishes/${slug}/${wishId}.json
 */
export async function saveWish(slug, wishData) {
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
    throw new Error('Valid slug is required to save a wish');
  }

  const wishId = wishData.id || generateWishId();
  if (!wishId || !/^[a-zA-Z0-9_-]+$/.test(wishId)) {
    throw new Error('Valid wishId is required to save a wish');
  }

  // For audio wishes: audioUrl is the audio file, photoUrl is the optional memory photo (kept separate)
  const audioUrl = (wishData.audioUrl || '').trim();
  const photoUrl = (wishData.photoUrl || '').trim();
  // mediaUrl = the primary displayable media (audio file URL for audio wishes, photo/video URL otherwise)
  const mediaUrl = (wishData.mediaUrl || audioUrl || photoUrl || '').trim();

  const isAudioWish = wishData.mediaType === 'audio' || Boolean(audioUrl);
  const inferredMediaType =
    wishData.mediaType ||
    (audioUrl ? 'audio' : mediaUrl ? (/\.(mp4|webm|mov)(\?.*)?$/i.test(mediaUrl) ? 'video' : 'photo') : null);

  const wish = {
    id: wishId,
    name: (wishData.name || '').trim(),
    message: (wishData.message || '').trim(),
    // photoUrl: for audio wishes, this is the optional memory/kenangan photo (separate from audio file)
    // for photo/video wishes, this equals mediaUrl
    photoUrl: isAudioWish ? photoUrl : (mediaUrl || photoUrl),
    mediaUrl,
    mediaType: inferredMediaType,
    audioUrl: audioUrl || (isAudioWish ? mediaUrl : ''),
    audioDuration: wishData.audioDuration ? Number(wishData.audioDuration) : null,
    createdAt: wishData.createdAt || new Date().toISOString(),
  };

  // 1. Cloudflare KV (if configured)
  if (isKVConfigured()) {
    try {
      const kvKey = `wish:${slug}:${wishId}`;
      const res = await fetch(`${KV_BASE()}/values/${encodeURIComponent(kvKey)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
        body: JSON.stringify(wish),
        cache: 'no-store',
      });
      if (!res.ok) {
        console.error(`KV PUT failed for wish ${kvKey}:`, res.status);
      }
    } catch (err) {
      console.error('Error saving wish to KV:', err);
    }
  }

  // 2. Local Filesystem Fallback / Persistence
  try {
    const parentDir = path.resolve(process.cwd(), 'data', 'wishes');
    const baseDir = path.resolve(parentDir, slug);
    if (!baseDir.startsWith(parentDir + path.sep)) {
      throw new Error('Invalid base directory path');
    }

    fs.mkdirSync(baseDir, { recursive: true });
    const targetFile = path.resolve(baseDir, `${wishId}.json`);
    if (!targetFile.startsWith(baseDir + path.sep)) {
      throw new Error('Invalid target file path');
    }

    fs.writeFileSync(targetFile, JSON.stringify(wish, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving wish to local filesystem:', err);
  }

  return wish;
}

/**
 * Retrieve all wishes for a slug, deduplicating by ID and sorting ascending by createdAt.
 */
export async function getWishesBySlug(slug) {
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) return [];

  const wishMap = new Map();

  // 1. Fetch from Cloudflare KV prefix if configured
  if (isKVConfigured()) {
    try {
      const prefix = `wish:${slug}:`;
      const listRes = await fetch(`${KV_BASE()}/keys?prefix=${encodeURIComponent(prefix)}&limit=1000`, {
        headers: kvHeaders(),
        cache: 'no-store',
      });
      if (listRes.ok) {
        const listData = await listRes.json();
        const keys = (listData.result || []).map((k) => k.name);

        const fetchedWishes = await Promise.all(
          keys.map(async (key) => {
            try {
              const res = await fetch(`${KV_BASE()}/values/${encodeURIComponent(key)}`, {
                headers: kvHeaders(),
                cache: 'no-store',
              });
              if (!res.ok) return null;
              const text = await res.text();
              return JSON.parse(text);
            } catch {
              return null;
            }
          })
        );

        for (const w of fetchedWishes) {
          if (w && w.id) {
            wishMap.set(w.id, w);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching wishes from KV:', err);
    }
  }

  // 2. Read from local filesystem directory
  try {
    const parentDir = path.resolve(process.cwd(), 'data', 'wishes');
    const baseDir = path.resolve(parentDir, slug);
    if (!baseDir.startsWith(parentDir + path.sep)) {
      return [];
    }

    if (fs.existsSync(baseDir)) {
      const files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const filePath = path.resolve(baseDir, file);
          if (!filePath.startsWith(baseDir + path.sep)) {
            continue;
          }
          const raw = fs.readFileSync(filePath, 'utf-8');
          const w = JSON.parse(raw);
          if (w && w.id && !wishMap.has(w.id)) {
            wishMap.set(w.id, w);
          }
        } catch {
          // ignore malformed file
        }
      }
    }
  } catch (err) {
    console.error('Error reading local wishes:', err);
  }

  const wishes = Array.from(wishMap.values()).map((w) => {
    const isAudioWish = w.mediaType === 'audio' || Boolean(w.audioUrl);
    // Resolve mediaUrl: primary media reference (audio URL for audio, photo/video URL otherwise)
    const resolvedMedia = (w.mediaUrl || w.audioUrl || w.photoUrl || '').trim();
    // photoUrl for audio wishes: keep the stored photo (memory photo), not the audio URL
    const resolvedPhoto = isAudioWish ? (w.photoUrl || '').trim() : resolvedMedia;

    return {
      ...w,
      photoUrl: resolvedPhoto,
      mediaUrl: resolvedMedia,
      audioUrl: isAudioWish ? ((w.audioUrl || resolvedMedia).trim()) : (w.audioUrl || ''),
      audioDuration: w.audioDuration ?? null,
      mediaType:
        w.mediaType ||
        (isAudioWish ? 'audio' : resolvedMedia ? (/\.(mp4|webm|mov)(\?.*)?$/i.test(resolvedMedia) ? 'video' : 'photo') : null),
    };
  });

  // Sort chronologically ascending
  wishes.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

  return wishes;
}

/**
 * Delete a wish from KV and local filesystem.
 */
export async function deleteWish(slug, wishId) {
  if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) return false;
  if (!wishId || !/^[a-zA-Z0-9_-]+$/.test(wishId)) return false;

  // 1. Cloudflare KV
  if (isKVConfigured()) {
    try {
      const kvKey = `wish:${slug}:${wishId}`;
      await fetch(`${KV_BASE()}/values/${encodeURIComponent(kvKey)}`, {
        method: 'DELETE',
        headers: kvHeaders(),
        cache: 'no-store',
      });
    } catch (err) {
      console.error('Error deleting wish from KV:', err);
    }
  }

  // 2. Local Filesystem
  try {
    const baseDir = path.resolve(process.cwd(), 'data', 'wishes', slug);
    const targetFile = path.resolve(baseDir, `${wishId}.json`);
    if (!targetFile.startsWith(baseDir + path.sep)) {
      return false;
    }

    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
  } catch (err) {
    console.error('Error deleting local wish file:', err);
    return false;
  }

  return true;
}
