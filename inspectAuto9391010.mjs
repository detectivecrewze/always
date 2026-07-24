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

async function main() {
  const kvId = 'auto-9391010';
  console.log(`Fetching data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  const draft = await cfGet(`draft:${kvId}`);
  console.log('Recipient:', gift?.recipient);
  console.log('Customer:', draft?.customerName);
  console.log('Photos count:', gift?.photos?.length);
  console.log('Photos:', gift?.photos);
}

main().catch(console.error);
