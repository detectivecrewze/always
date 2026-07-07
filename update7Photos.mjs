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

const slug = 'auto-8592910';

async function run() {
  const draft = await cfGet(`draft:${slug}`);
  if (!draft) {
    console.error("Draft not found!");
    return;
  }
  
  // They said they uploaded 7 photos.
  // We need a 7-part quote for a birthday (Lidyaa, from Nabil).
  const captions = [
    "Selamat", "ulang", "tahun,", "cintaku.", "Teruslah", "mekar", "indah. 🤍"
  ];
  
  if (!draft.photos) draft.photos = [];
  
  // Keep only the first 7 photos or create them if they don't exist
  // Make sure we keep the URLs they uploaded
  const updatedPhotos = [];
  for (let i = 0; i < captions.length; i++) {
    const existingUrl = (draft.photos[i] && draft.photos[i].url) ? draft.photos[i].url : "";
    updatedPhotos.push({
      url: existingUrl,
      caption: captions[i]
    });
  }
  
  draft.photos = updatedPhotos;
  
  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft);
  
  if (success1 && success2) {
    console.log(`KV updated successfully for ${slug} with 7 photos!`);
  }
}

run();
