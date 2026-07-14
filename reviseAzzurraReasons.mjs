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
  const kvId = 'auto-mey61yk';

  console.log(`Fetching current gift data for ${kvId}...`);
  const giftData = await cfGet(`gift:${kvId}`);
  if (!giftData) {
    console.error(`Error: Could not find gift:${kvId}`);
    return;
  }

  // Revise only the reasons to be full English
  giftData.reasons = [
    {
      title: 'Like Joy in Inside Out',
      desc: 'Your presence brings such a bright and happy energy into my life every single day.'
    },
    {
      title: 'My Lifesaver',
      desc: 'Thank you for staying by my side and saving me during my loneliest moments.'
    },
    {
      title: '10 Years Together',
      desc: 'It has been a decade of our friendship, and I would not trade it for anything.'
    },
    {
      title: 'Making Me Laugh',
      desc: 'Only you can make me laugh until my jaw hurts and make me forget all my problems.'
    },
    {
      title: 'You Deserve The World',
      desc: 'You truly deserve all the beautiful and wonderful things this world has to offer.'
    },
    {
      title: 'My Best Prayers For You',
      desc: 'I hope the universe always gives you beautiful surprises for every prayer you make.'
    }
  ];

  console.log('Saving updated gift data (reasons only)...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Done! Reasons for Azzurra's order (${kvId}) have been revised to full English.`);
}

main().catch(console.error);
