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
  const kvId = 'auto-zybhhrc';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Update introText to be in Indonesian, santai, bucin & tidak kaku
  gift.introText = [
    "Happy Girlfriend's Day yaa, Vivi pacarkuu tersayang! 💖 Hari ini aku cuma mau nyampein sesuatu yang mungkin jarang aku bilang langsung ke kamu.",
    "Makasih banyak yaa sayang udah hadir di hidup aku. Makasih udah selalu sabar ngadepin aku, selalu ada di setiap kondisiku, dan selalu punya cara buat bikin duniaku terasa jauh lebih berwarna.",
    "Jujur, aku bersyukur banget bisa punya kamu. Setiap momen, senyuman, dan canda tawa bareng kamu tuh selalu jadi bagian favorit dalam hari-hariku.",
    "Semoga kita bisa terus bareng-bareng yaa, saling dukung, saling jaga, dan bikin lebih banyak kenangan manis lainnya. Happy Girlfriend's Day sekali lagi yaa kesayanganku, I love you so much! 🤍"
  ];

  console.log('Saving updated letter to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done updating letter!');
}

main().catch(console.error);
