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
  const kvId = 'auto-v4oobiq';
  console.log(`Fetching existing gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Update ONLY Hero Section fields without touching anything else
  gift.heroPreTitle = "to my prettiest girl";
  gift.heroLine1 = "Happy 18th Birthday,";
  gift.heroLine2 = "Gina Khoirunisa 🤍✨";
  gift.heroSubtitle = "Merayakan 18 tahun perjalanan usiamu, sosok paling spesial dan rumah terbaik tempatku berpulang.";

  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Successfully updated ONLY Hero Section in ${kvId}!`);
}

main().catch(console.error);
