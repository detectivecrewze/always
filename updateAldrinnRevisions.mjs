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
  const kvId = 'auto-zybhhrc';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // 1. Time section: 9 July 2026 (2026-07-09)
  gift.timeEnabled = true;
  gift.timeTitle = "Cerita Kita";
  gift.timeSubtitle = "saling mencintai dan melengkapi sejak";
  gift.timeStartDate = "2026-07-09";

  // 2. Gallery section title: "Your Beautiful" + "Pictures"
  gift.galleryTitle1 = "Your Beautiful";
  gift.galleryTitle2 = "Pictures";

  // 3. Reason section desc: Full Indonesia (santai & bucin, tidak kaku/baku)
  gift.reasonsTitle1 = "6 Hal Yang";
  gift.reasonsTitle2 = "Bikin Aku Makin Bucin";
  
  gift.reasons = [
    {
      icon: "🌟",
      title: "Your Radiant Smile",
      desc: "Senyum manis kamu tuh selalu bisa bikin hariku yang capek langsung berasa bahagia lagi."
    },
    {
      icon: "🧸",
      title: "Your Endless Patience",
      desc: "Makasih yaa udah selalu sabar dan pengertian banget ngadepin semua sifat dan kelakuanku."
    },
    {
      icon: "🤍",
      title: "Your Warm Energy",
      desc: "Kehadiran kamu tuh selalu bikin aku merasa nyaman, tenang, dan bersyukur banget punya kamu."
    },
    {
      icon: "🤝",
      title: "Always Being There",
      desc: "Terima kasih selalu ada di sampingku dan jadi tempat cerita terbaik setiap harinya."
    },
    {
      icon: "💬",
      title: "Our Fun Conversations",
      desc: "Setiap ngobrol dan bercanda sama kamu nggak pernah gagal bikin aku makin sayang."
    },
    {
      icon: "✨",
      title: "Simply Being You",
      desc: "Aku bener-bener bersyukur punya kamu, makasih yaa udah jadi diri kamu yang luar biasa!"
    }
  ];

  console.log('Saving updated revisions to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done updating Aldrinn & Vivi gift!');
}

main().catch(console.error);
