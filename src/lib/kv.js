/**
 * Cloudflare KV REST API wrapper
 * Falls back to local data/gifts.json if env vars are not set
 */

const BASE = () =>
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}`;

const headers = () => ({
  Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
  'Content-Type': 'application/json',
});

export function isKVConfigured() {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_API_TOKEN &&
    process.env.KV_NAMESPACE_ID
  );
}

async function kvGet(key) {
  const res = await fetch(`${BASE()}/values/${encodeURIComponent(key)}`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET failed: ${res.status}`);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function kvPut(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`${BASE()}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
    body,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`KV PUT failed: ${res.status}`);
}

async function kvDelete(key) {
  const res = await fetch(`${BASE()}/values/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok && res.status !== 404) throw new Error(`KV DELETE failed: ${res.status}`);
}

export async function listGifts() {
  const index = await kvGet('gift:_index');
  return Array.isArray(index) ? index : [];
}

export async function getGift(slug) {
  return kvGet(`gift:${slug}`);
}

export async function putGift(slug, data) {
  await kvPut(`gift:${slug}`, data);
  // Update index
  const index = await listGifts();
  if (!index.includes(slug)) {
    await kvPut('gift:_index', [...index, slug]);
  }
}

export async function deleteGift(slug) {
  await kvDelete(`gift:${slug}`);
  const index = await listGifts();
  await kvPut('gift:_index', index.filter((s) => s !== slug));
}
