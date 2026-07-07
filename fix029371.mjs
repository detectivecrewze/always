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
  if (!draft) return;
  
  // Custom English Reasons tailored for LDR/Paris context
  draft.reasons = [
    { title: "Your Smile", desc: "Even miles away in Paris, the thought of your smile brightens my entire day." },
    { title: "Our Paths", desc: "Out of this enormous world, I am forever grateful that our paths finally crossed." },
    { title: "Your Heart", desc: "Distance means nothing when someone means everything. You always have a special place in my heart." },
    { title: "Your Soul", desc: "So pure and genuine, I am incredibly lucky to have you in my life, Amore." },
    { title: "Your Kindness", desc: "I hope life is always as kind to you as you have been to me." },
    { title: "Our Future", desc: "If there is another life, I hope I find you earlier to spend more time with you." }
  ];
  
  // Outro also needs to be English
  draft.closingParagraph = "Just like keepsakes that we treasure, every moment with you is a memory I will hold close to my heart. I hope you have a beautiful birthday in Paris. I can't wait to make more keepsakes with you.";
  
  await cfSet(`draft:${slug}`, draft);
  await cfSet(`gift:${slug}`, draft);
  console.log('Fixed for-029371');
}
run();
