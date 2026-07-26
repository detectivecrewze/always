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
  const kvId = 'gift-1784978642362';
  console.log(`Fetching existing gift data for ${kvId}...`);
  const gift = await cfGet(`gift:${kvId}`);
  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Preserve everything, only update nickname "Nurul" to "Aish"
  if (gift.heroLine2) {
    gift.heroLine2 = gift.heroLine2.replace(/Nurul Aisyah/g, 'Aish').replace(/Nurul/g, 'Aish');
  }

  if (gift.introHeadline3) {
    gift.introHeadline3 = gift.introHeadline3.replace(/Nurul Aisyah/g, 'Aish').replace(/Nurul/g, 'Aish');
  }

  // Update photo caption word from "Nurul" to "Aish"
  if (gift.photos && Array.isArray(gift.photos)) {
    gift.photos = gift.photos.map(p => ({
      ...p,
      caption: p.caption === 'Nurul' ? 'Aish' : (p.caption ? p.caption.replace(/Nurul/g, 'Aish') : '')
    }));
  }

  if (gift.secretCaption) {
    gift.secretCaption = gift.secretCaption.replace(/Nurul Aisyah/g, 'Aish').replace(/Nurul/g, 'Aish');
  }

  if (gift.closingParagraph) {
    gift.closingParagraph = gift.closingParagraph.replace(/Nurul Aisyah/g, 'Aish').replace(/Nurul/g, 'Aish');
  }

  await cfSet(`gift:${kvId}`, gift);
  console.log(`✅ Successfully updated nickname to "Aish" in ${kvId} without touching music or other manual edits!`);
}

main().catch(console.error);
