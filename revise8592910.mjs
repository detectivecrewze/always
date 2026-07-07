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
  
  // 1. Title Case for Intro Headline
  draft.introHeadline1 = "The Best Part";
  draft.introHeadline2 = "Of My Entire";
  draft.introHeadline3 = "Everyday Life.";
  
  // 2. Longer Reasons
  draft.reasons = [
    { title: "Your Smile", desc: "Senyummu selalu berhasil mengalihkan duniaku dan membuatku melupakan semua beban harianku." },
    { title: "Your Heart", desc: "Hatimu yang tulus dan penuh kasih membuatku sangat bersyukur bisa memilikimu." },
    { title: "Your Laugh", desc: "Suara tawamu adalah musik favoritku yang selalu ingin aku dengar setiap saat." },
    { title: "Your Soul", desc: "Jiwa yang begitu murni dan jujur, kamu adalah orang paling luar biasa yang pernah aku temui." },
    { title: "Your Kindness", desc: "Kebaikan hatimu selalu memancarkan kehangatan untuk semua orang di sekitarmu." },
    { title: "Your Presence", desc: "Hanya dengan kehadiranmu saja sudah cukup untuk membuat hariku terasa sangat sempurna." }
  ];
  
  // 3. Delete Seasons
  delete draft.seasons;
  
  const success1 = await cfSet(`draft:${slug}`, draft);
  const success2 = await cfSet(`gift:${slug}`, draft);
  
  if (success1 && success2) {
    console.log(`KV updated successfully for ${slug}!`);
  }
}

run();
