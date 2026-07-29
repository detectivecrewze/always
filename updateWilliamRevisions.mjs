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
  const kvId = 'auto-prrsnle';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Make language casual, santai & bucin across all sections
  gift.heroSubtitle = "Makasih yaa udah selalu sabar ngadepin aku dan selalu bikin duniaku terasa jauh lebih manis.";

  gift.introText = [
    "Happy Girlfriend Day yaa, cantikku! 🤍 Hari ini aku cuma mau nyampein beberapa hal manis yang bener-bener dari hati buat kamu.",
    "Makasih yaa udah mau temenin aku sampai sekarang. Makasih juga udah selalu sabar ngadepin kelakuanku yang mungkin kadang aneh dan ngaco ini WKWK...",
    "Semoga ke depannya kita bisa tetap saling jaga, makin kompak, dan semoga cerita manis kita ini nggak cuma berhenti sampai hari ini aja, tapi terus berlanjut selamanya.",
    "Terima kasih udah hadir dan jadi bagian paling berharga di hidup aku. Love you always, princessku! 🫶✨"
  ];

  gift.reasonsTitle1 = "6 Hal Yang";
  gift.reasonsTitle2 = "Bikin Aku Makin Bucin";

  gift.reasons = [
    {
      icon: "🥺",
      title: "Sabar Banget",
      desc: "Makasih yaa udah selalu sabar ngadepin kelakuanku yang kadang aneh dan ngaco."
    },
    {
      icon: "🫂",
      title: "Setia Nemeni",
      desc: "Makasih udah mau tetep bertahan dan nemenin aku sampai detik ini."
    },
    {
      icon: "🌟",
      title: "Senyumnya Adhem",
      desc: "Senyum manis kamu tuh selalu bisa bikin hariku yang capek jadi seneng lagi."
    },
    {
      icon: "🤍",
      title: "Tulus Nyayangin",
      desc: "Caramu nyayangin aku bikin aku ngerasa jadi cowok paling beruntung di dunia."
    },
    {
      icon: "🤝",
      title: "Selalu Pengertian",
      desc: "Aku seneng banget kita selalu bisa saling ngerti dan nerima apa adanya."
    },
    {
      icon: "✨",
      title: "Bikin Hari Ceria",
      desc: "Hadirnya kamu tuh beneran bikin duniaku terasa jauh lebih berwarna."
    }
  ];

  gift.closingParagraph = "Makasih banyak yaa sayang udah jadi alasan senyumku tiap hari. Yuk kita bikin lebih banyak kenangan manis dan lucu lainnya bareng-bareng!";
  gift.celebrateBtnText = "bucin terus ✨";

  console.log('Saving updated revisions to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done updating William & Aca gift!');
}

main().catch(console.error);
