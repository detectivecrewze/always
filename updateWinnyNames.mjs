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
  const kvId = 'auto-7f1k8w6';
  console.log(`Fetching current gift for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  
  if (!gift) {
    console.error("Gift not found!");
    return;
  }

  // Adding names to introText
  const namesStr = "Untuk teman-teman terbaikku: Winny, Maya, Godrin, Devi, Sariz, Dewi, Amel, Bika, Chintya, Agika, dan Bagus. Terima kasih untuk kenangan indahnya.";
  
  // Checking if already added
  if (!gift.introText[gift.introText.length - 1].includes("Bagus")) {
    gift.introText.push(namesStr);
    
    console.log(`Saving updated gift for ${kvId}...`);
    await cfSet(`gift:${kvId}`, gift);
    console.log(`✅ Names added successfully!`);
  } else {
    console.log(`Names already exist.`);
  }
}

main().catch(console.error);
