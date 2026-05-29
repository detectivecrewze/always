import fs from 'fs';
import path from 'path';
import { isKVConfigured, getGift, listGifts } from './kv';

export async function getGiftBySlug(slug) {
  // Try KV first
  if (isKVConfigured()) {
    const gift = await getGift(slug);
    if (gift) return gift;
  }

  // Local fallback
  try {
    const filePath = path.join(process.cwd(), 'data', 'gifts.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const gifts = JSON.parse(raw);
    return gifts.find((g) => g.slug === slug) || null;
  } catch {
    return null;
  }
}

export async function getAllGifts() {
  if (isKVConfigured()) {
    const slugs = await listGifts();
    const gifts = await Promise.all(slugs.map((s) => getGift(s)));
    return gifts.filter(Boolean);
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'gifts.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
