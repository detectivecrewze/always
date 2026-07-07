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
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function cfSet(key, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body
  });
  return res.ok;
}

const slug = 'for-029371';

async function run() {
  const draft = await cfGet(`draft:${slug}`);
  const orderData = await cfGet(`order:ORD-MRAOOPNE`); // Order Details says: ORD-MRAOOPNE
  
  if (!draft) return console.log('Draft not found');
  
  // The quotes currently in the draft
  const currentQuotes = draft.photos.map(p => p.caption);
  
  // The photos uploaded by the customer in the order
  let orderPhotos = [];
  if (orderData && orderData.photos) {
    orderPhotos = orderData.photos;
  }
  
  // Update the draft photos with the URLs from the order
  draft.photos = currentQuotes.map((caption, i) => {
    // orderPhotos can be an array of strings or objects depending on how it was saved
    const rawPhoto = orderPhotos[i];
    const url = typeof rawPhoto === 'string' ? rawPhoto : (rawPhoto?.url || '');
    return {
      url: url,
      caption: caption
    };
  });
  
  await cfSet(`draft:${slug}`, draft);
  await cfSet(`gift:${slug}`, draft);
  
  console.log('Fixed photos for for-029371. Photos count from order:', orderPhotos.length);
}
run();
