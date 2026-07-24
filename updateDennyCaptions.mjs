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
  const kvId = 'auto-6uzq4gd';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  const urls = [
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813323616-WhatsApp_Image_2026-07-23_at_19.55.33.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813310817-WhatsApp_Video_2026-07-23_at_19.57.46.mp4',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813314945-WhatsApp_Video_2026-07-23_at_19.57.15.mp4',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813325727-WhatsApp_Image_2026-07-23_at_19.55.31.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813327671-WhatsApp_Image_2026-07-23_at_19.55.30.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813317859-WhatsApp_Video_2026-07-23_at_19.56.05.mp4',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813321200-WhatsApp_Video_2026-07-23_at_19.55.37.mp4',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813329538-WhatsApp_Image_2026-07-23_at_19.55.29__1_.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813331113-WhatsApp_Image_2026-07-23_at_19.55.29.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813333222-WhatsApp_Image_2026-07-23_at_19.55.28.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813335462-WhatsApp_Image_2026-07-23_at_19.55.27.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813337296-WhatsApp_Image_2026-07-23_at_19.55.26.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813340503-WhatsApp_Image_2026-07-23_at_19.52.30.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813343369-WhatsApp_Image_2026-07-23_at_19.52.13.jpeg',
    'https://always.for-you-always.my.id/auto-6uzq4gd/1784813346193-WhatsApp_Image_2026-07-23_at_19.52.10__2_.jpeg'
  ];

  const words = [
    "Happy", "Twentieth", "Birthday", "Trisna", "My",
    "Dearest", "Love", "Thank", "You", "For",
    "Brightening", "My", "World", "Always", "❤️"
  ];

  const photos = [];
  for (let i = 0; i < urls.length; i++) {
    photos.push({
      url: urls[i],
      caption: words[i] || ''
    });
  }

  gift.photos = photos;
  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Restored ${photos.length} photos with captions for ${kvId}!`);
}

main().catch(console.error);
