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
  const kvId = 'auto-tpmfpy8';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // 1. Update Time section to count forward from 2026-06-26
  gift.timeEnabled = true;
  gift.timeTitle = "Cerita Kita";
  gift.timeSubtitle = "saling menyayangi dan melengkapi sejak";
  gift.timeStartDate = "2026-06-26";

  // 2. Make language more casual, santai & bucin across sections
  gift.heroSubtitle = "Terima kasih yaa udah selalu ada dan bikin aku makin hari makin sayang sama kamu.";
  
  gift.reasonsTitle1 = "6 Hal Yang";
  gift.reasonsTitle2 = "Bikin Aku Makin Bucin";
  
  gift.reasons = [
    {
      icon: "🥺",
      title: "Sabar Banget",
      desc: "Makasih yaa udah selalu sabar ngadepin sifat dan mood aku yang suka ngaco."
    },
    {
      icon: "🫂",
      title: "Selalu Ada",
      desc: "Makasih udah tetep bertahan dan nemenin aku dalam kondisi apa pun."
    },
    {
      icon: "🌟",
      title: "Senyumnya Bikin Adem",
      desc: "Senyum kamu tuh selalu bisa bikin hari-hariku yang capek jadi tenang lagi."
    },
    {
      icon: "🤍",
      title: "Tulus Banget",
      desc: "Caramu nyayangin aku bikin aku ngerasa jadi cowok paling beruntung di dunia."
    },
    {
      icon: "🤝",
      title: "Selalu Saling Support",
      desc: "Aku seneng banget kita selalu bisa saling dukung dan ngertiin satu sama lain."
    },
    {
      icon: "✨",
      title: "Bikin Hari Lebih Seru",
      desc: "Hadirnya kamu di hidupku beneran bikin semuanya jadi jauh lebih berwarna."
    }
  ];

  gift.closingParagraph = "Makasih banyak yaa sayang udah jadi alasan senyumku tiap hari. Yuk terus bareng-bareng, saling jaga, dan bikin lebih banyak kenangan lucu lainnya!";
  gift.celebrateBtnText = "bucin terus ✨";

  console.log('Saving updated revisions to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done updating Johar & Naylaa gift!');
}

main().catch(console.error);
