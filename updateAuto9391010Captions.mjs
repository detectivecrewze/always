import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envStr = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envStr.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const namespaceId = env.KV_NAMESPACE_ID;
const token = env.CLOUDFLARE_API_TOKEN;

async function cfGet(key) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function cfSet(key, value) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(value)
  });
  return res.json();
}

async function main() {
  const kvId = 'auto-9391010';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  const words = [
    "Selamat", "Ulang", "Tahun", "Sayangku", "Terima",
    "Kasih", "Sudah", "Selalu", "Jadi", "Kebahagiaan",
    "Terindah", "Dalam", "Hidupku", "Ya", "🤍"
  ];

  const photos = gift.photos || [];
  console.log(`Updating captions for ${photos.length} photos...`);

  for (let i = 0; i < photos.length; i++) {
    photos[i].caption = words[i] || '';
  }

  // ONLY update photos, leave every other field unchanged
  gift.photos = photos;

  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ ONLY photo captions updated for ${kvId} without touching any other fields!`);
}

main().catch(console.error);
