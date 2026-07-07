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
  
  draft.reasons = [
    { title: "Your Smile", desc: "It literally brightens up my darkest days. Melihat kamu tersenyum selalu jadi alasan utamaku buat terus semangat." },
    { title: "Your Heart", desc: "So pure and genuine, selalu bikin aku ngerasa beruntung banget bisa memilikimu di hidupku ini." },
    { title: "Your Strength", desc: "The way you keep going despite everything, aku bener-bener bangga. You are truly my inspiration." },
    { title: "Your Care", desc: "Perhatian-perhatian kecil kamu yang tulus always makes me feel deeply loved and appreciated setiap harinya." },
    { title: "Your Comfort", desc: "Being with you feels like coming home. Kamu adalah tempat paling aman dan nyaman buat aku bersandar." },
    { title: "Your Everything", desc: "Just you being you, is always more than enough. Nggak ada yang pengen aku ubah dari kamu, sayang." }
  ];
  
  // Remove seasons section so it doesn't render
  delete draft.seasons;
  
  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft);
  
  if (success1 && success2) {
    console.log(`KV updated successfully for ${slug}!`);
  }
}

run();
