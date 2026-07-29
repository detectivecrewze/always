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
  const kvId = 'auto-40iwusr';
  console.log(`Fetching gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found');
    return;
  }
  
  // Extend introText to be longer and more romantic (Tone: Santai, Puitis, Indoglish)
  // Original base message: "sama sama teruss yaa sayangg"
  gift.introText = [
    "Happy Girlfriend's Day, sayangg! Maybe I don't say this enough, tapi aku bener-bener bersyukur banget ada kamu di hidup aku.",
    "Tiap hari bareng kamu rasanya kayak dapet berkat yang nggak ada habisnya. You always know how to make my world so much brighter, even di hari-hari yang paling melelahkan sekalipun.",
    "Aku cuma mau bilang makasih yaa udah jadi partner yang luar biasa. Harapanku sederhana, aku pengen kita bisa sama sama teruss yaa sayangg, ngelewatin semua hal bareng-bareng.",
    "Let's write many more beautiful chapters together. I promise to always try my best for you and our future. I love you so much, more than words can say! ✨"
  ];

  console.log('Updating gift payload in KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('✅ Raffid & Hafizah intro text extended and updated successfully!');
}

main().catch(console.error);
