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
  const kvId = 'gift-1784629253476';
  const orderId = 'ORD-MRVFRZY9';

  console.log(`Fetching latest order data for ${orderId}...`);
  const order = await cfGet(`order:${orderId}`);
  const orderPhotos = (order && order.photos) ? order.photos : [];

  console.log(`Found ${orderPhotos.length} photos in KV.`);

  console.log(`Fetching current gift for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  
  if (!gift) {
    console.error("Gift not found!");
    return;
  }

  // Needs exactly 9 words now
  const words = ["Happy", "Thirty", "Fifth", "Birthday", "To", "My", "One", "True", "Love"];
  
  const photos = [];
  for (let i = 0; i < 9; i++) {
    photos.push({
      url: orderPhotos[i] || '',
      caption: words[i] || ''
    });
  }

  gift.photos = photos;
  
  console.log(`Saving updated gift for ${kvId}...`);
  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Photos updated successfully!`);
}

main().catch(console.error);
