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
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function cfSet(key, value) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });
  return res.ok;
}

const captions = [
  "Dari segala hal yang tak terduga,",
  "hadirmu adalah kejutan paling indah",
  "yang pernah semesta berikan untukku.",
  "Setiap tawa yang kita bagi,",
  "dan setiap langkah yang kita lalui,",
  "adalah kepingan cerita yang paling aku syukuri.",
  "Meski waktu terus berjalan maju,",
  "rasa ini akan terus bertumbuh untukmu.",
  "Terima kasih sudah mau bertahan,",
  "menjadi tempat ternyaman untukku berpulang.",
  "Mari terus melangkah bersama,",
  "calon teman hidupku selamanya. 🤍"
];

async function run() {
  const id = 'auto-30192301';
  
  // Update Draft
  console.log('Fetching draft...');
  const draft = await cfGet(`draft:${id}`);
  console.log('Draft data:', draft ? Object.keys(draft) : null);
  if (draft && draft.photos) {
    for (let i = 0; i < Math.min(draft.photos.length, captions.length); i++) {
      if (typeof draft.photos[i] === 'string') {
        draft.photos[i] = { url: draft.photos[i], caption: captions[i] };
      } else {
        draft.photos[i].caption = captions[i];
      }
    }
    await cfSet(`draft:${id}`, draft);
    console.log("Draft galleries updated!");
  }

  // Update Order
  console.log('Fetching order...');
  const order = await cfGet(`order:${id}`);
  console.log('Order data:', order ? Object.keys(order) : null);
  if (order && order.data && order.data.photos) {
    for (let i = 0; i < Math.min(order.data.photos.length, captions.length); i++) {
      if (typeof order.data.photos[i] === 'string') {
        order.data.photos[i] = { url: order.data.photos[i], caption: captions[i] };
      } else {
        order.data.photos[i].caption = captions[i];
      }
    }
    await cfSet(`order:${id}`, order);
    console.log("Order galleries updated!");
  }
}

run();
