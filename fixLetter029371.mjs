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
  if (!draft) return console.log('Draft not found');
  
  draft.introText = [
    "Happy birthday Amore. I hope this new chapter of your life brings you endless happiness, beautiful experiences, and absolutely everything you have ever dreamed of. No matter where life takes us or what the future holds, I will always be profoundly grateful that, in this enormous world, our paths crossed and we found each other.",
    "I truly wish I could be there with you today, holding your hand, celebrating your special day, and seeing that beautiful smile of yours in person. Even though you are miles away in Paris and I am here, the distance means nothing because you will always have the most special place in my heart.",
    "I hope life is always exceptionally kind to you, just as you have been to me. And if there is another life after this one, I sincerely hope I find you a little earlier, so I can have even more time to love you and be with you. Have the happiest birthday, my love."
  ];
  
  await cfSet(`draft:${slug}`, draft);
  await cfSet(`gift:${slug}`, draft);
  console.log('Fixed letter section for for-029371');
}
run();
