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
  const kvId = 'auto-kfzytms';
  
  console.log(`Fetching gift data for ${kvId}...`);
  const giftData = await cfGet(`gift:${kvId}`);
  
  if (!giftData) {
    console.error('Gift data not found!');
    return;
  }
  
  if (!giftData.photos) {
    giftData.photos = [];
  }
  
  console.log(`Current photos count: ${giftData.photos.length}`);
  
  const words = ["Semoga", "Perjuangan", "Kita", "Berdua", "Bisa", "Berbuah", "Manis", "Sayang", "Amin", "🤍"];
  
  if (giftData.photos.length !== words.length) {
    console.warn(`Warning: Photos length (${giftData.photos.length}) does not match words length (${words.length})`);
  }
  
  for (let i = 0; i < giftData.photos.length; i++) {
    if (i < words.length) {
      giftData.photos[i].caption = words[i];
    }
  }
  
  console.log(`Saving updated gift for ${kvId}...`);
  await cfSet(`gift:${kvId}`, giftData);
  
  console.log(`✅ Photos captions updated successfully!`);
}

main().catch(console.error);
