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

  // Preserve the dynamic age from the previous change if it's there (26th)
  // Let's do a direct replace of the array
  // The first line should have the age dynamically, let's keep the existing first line if it's just 'NIKEEEENNN...'
  // But wait, it's safer to just provide the exact full English text and replace 26th manually just in case.
  // Actually, we know the age was updated to 26 in the previous step.

  const currentFirstLine = giftData.introText && giftData.introText[0] ? giftData.introText[0] : "NIKEEEENNN! Happy 26th birthday to you!!! 🥳";

  giftData.introText = [
    currentFirstLine,
    "I wish you a long, happy life surrounded by good people, endless blessings, and I hope everything you've ever wished for comes true.",
    "Niken, thank you so much for staying by my side and being with me for these past 10 years.",
    "Thank you for accompanying me and saving me during the times I felt truly alone.",
    "You know what? Your presence really feels like the character 'Joy' from Inside Out to me.",
    "Every time I'm with you, I feel so incredibly happy... to the point my jaw hurts from laughing and you successfully make me forget all my problems.",
    "I hope this year surprises you with everything you've been praying for.",
    "Keep shining, always. 🤍 Don't forget, you deserve all the beautiful things in life.",
    "I love you always, bestie! 🎂✨"
  ];

  console.log('Saving updated gift data (introText only)...');
  await cfSet(`gift:${kvId}`, giftData);

  console.log(`✅ Done! The letter (introText) for Azzurra's order (${kvId}) has been translated to full English.`);
}

main().catch(console.error);
