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
  const kvId = 'gift-1785137477036';
  console.log(`Fetching gift:${kvId}`);
  const gift = await cfGet(`gift:${kvId}`);

  if (!gift) {
    console.error('Gift not found!');
    return;
  }

  // Update section titles to English since language/tone is Indoglish
  gift.introPreTitle = "a little message";
  gift.introHeadline1 = "To My";
  gift.introHeadline2 = "Precious";
  gift.introHeadline3 = "Princess Kela";

  gift.galleryTitle1 = "Captured";
  gift.galleryTitle2 = "Memories";

  gift.reasonsTitle1 = "6 Reasons Why";
  gift.reasonsTitle2 = "I Fall For You";

  // Update Reason Card titles to English (Indoglish rule)
  if (gift.reasons && gift.reasons.length === 6) {
    gift.reasons[0].title = "Always Patient";
    gift.reasons[1].title = "Most Loyal";
    gift.reasons[2].title = "Always Cheerful";
    gift.reasons[3].title = "Cute & Needy";
    gift.reasons[4].title = "Pretty & Adorable";
    gift.reasons[5].title = "My Little Princess";
  }

  gift.closingPreTitle = "always & forever";
  gift.closingTitle1 = "Love You";
  gift.closingTitle2 = "My Princess ✨";

  console.log('Saving updated gift to KV...');
  await cfSet(`gift:${kvId}`, gift);
  console.log('Done updating titles to English!');
}

main().catch(console.error);
