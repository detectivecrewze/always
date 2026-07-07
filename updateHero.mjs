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

const slug = 'for-tari';

async function run() {
  const draft = await cfGet(`draft:${slug}`);
  if (!draft) {
    console.error("Draft not found!");
    return;
  }
  
  draft.heroPreTitle = "happy 2nd anniversary, tari";
  draft.heroLine1 = "To The Prettiest Girl,";
  draft.heroLine2 = "Tari ❤️";
  draft.heroSubtitle = "I Hope Our Anniversary Brings You As Much Joy As You Give To Me Every Single Day.";
  
  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft);
  
  if (success1 && success2) {
    console.log(`KV updated successfully for ${slug}!`);
  }
}

run();
