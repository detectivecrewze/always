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
  const kvId = 'gift-1785137477036';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift || !gift.photos) {
    console.error('Gift or photos not found!');
    return;
  }

  // 15 English words for 15 photos
  const englishWords = [
    "Happy",
    "Girlfriend",
    "Day",
    "To",
    "My",
    "Most",
    "Precious",
    "Little",
    "Princess",
    "Who",
    "Always",
    "Makes",
    "Me",
    "Smile",
    "🤍"
  ];

  for (let i = 0; i < gift.photos.length; i++) {
    gift.photos[i].caption = englishWords[i] || '';
  }

  console.log('Saving updated photo captions to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done updating photo captions!');
}

main().catch(console.error);
