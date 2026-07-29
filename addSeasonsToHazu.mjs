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
  const kvId = 'gift-1783604541955';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Add seasons array to giftData
  gift.seasonsTitle1 = "Through Every";
  gift.seasonsTitle2 = "Season of Life";
  
  gift.seasons = [
    {
      icon: "🌱",
      name: "Spring",
      teaser: "The unexpected bloom of new love",
      message: "When you walked into my life without knocking, you reignited the spark I thought I had lost. You brought back my loverboy self and gave me a fresh new beginning."
    },
    {
      icon: "☀️",
      name: "Summer",
      teaser: "The warmth of your laughter & smile",
      message: "Every time you laugh, the world feels brighter. From late night Discord calls to studying together, every moment with you fills my heart with genuine warmth."
    },
    {
      icon: "🍂",
      name: "Autumn",
      teaser: "Weathering every storm with patience",
      message: "Thank you for holding my hand through moments of insecurity and jealousy. Your kindness and grace inspire me to be a better partner every single day."
    },
    {
      icon: "❄️",
      name: "Winter",
      teaser: "A lifetime of choosing you",
      message: "No matter what life brings or how hard things get, I will always choose you. I look forward to growing old with you through every season of life."
    }
  ];

  console.log('Saving updated gift with seasons to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done adding seasons section!');
}

main().catch(console.error);
